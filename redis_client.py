import os
import json
import redis
from datetime import timedelta

# Redis Configuration
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
REDIS_DB = int(os.getenv('REDIS_DB', 0))
CACHE_TTL = int(os.getenv('CACHE_TTL', 3600))  # Default TTL: 1 hour

# Initialize Redis client
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    db=REDIS_DB,
    decode_responses=True
)

def is_redis_available():
    """Check if Redis is available"""
    try:
        return redis_client.ping()
    except redis.ConnectionError:
        return False

# Key generation helpers
def get_messages_key(user_id, friend_id, page=None, page_size=None):
    """Generate a Redis key for cached messages between two users"""
    users = sorted([str(user_id), str(friend_id)])
    base_key = f"messages:{users[0]}:{users[1]}"
    if page is not None and page_size is not None:
        return f"{base_key}:page:{page}:size:{page_size}"
    return base_key

def get_cached_messages(user_id, friend_id, page=None, page_size=None):
    """
    Retrieve cached messages for a conversation between two users
    
    Args:
        user_id (int): The ID of the current user
        friend_id (int): The ID of the friend/contact
        page (int, optional): Page number for pagination
        page_size (int, optional): Number of messages per page
        
    Returns:
        list or None: List of cached messages if found, None otherwise
    """
    if not is_redis_available():
        return None
        
    key = get_messages_key(user_id, friend_id, page, page_size)
    cached_data = redis_client.get(key)
    
    if cached_data:
        try:
            return json.loads(cached_data)
        except json.JSONDecodeError:
            # Invalid JSON, clear the cache
            redis_client.delete(key)
    
    return None

def cache_messages(user_id, friend_id, messages, page=None, page_size=None, ttl=CACHE_TTL):
    """
    Cache messages for a conversation between two users
    
    Args:
        user_id (int): The ID of the current user
        friend_id (int): The ID of the friend/contact
        messages (list): List of message objects to cache
        page (int, optional): Page number for pagination
        page_size (int, optional): Number of messages per page
        ttl (int, optional): Time-to-live in seconds
        
    Returns:
        bool: True if successful, False otherwise
    """
    if not is_redis_available() or not messages:
        return False
        
    key = get_messages_key(user_id, friend_id, page, page_size)
    
    try:
        # Cache the messages with TTL
        return redis_client.setex(
            key,
            timedelta(seconds=ttl),
            json.dumps(messages)
        )
    except (redis.RedisError, TypeError, ValueError):
        return False

def clear_message_cache(user_id, friend_id=None):
    """
    Clear the message cache for a specific conversation or all conversations of a user
    
    Args:
        user_id (int): The ID of the current user
        friend_id (int, optional): The ID of the friend/contact. If None, clears all conversation caches for the user.
        
    Returns:
        int: Number of cache keys deleted
    """
    if not is_redis_available():
        return 0
        
    if friend_id:
        # Clear specific conversation cache
        pattern = get_messages_key(user_id, friend_id) + "*"
    else:
        # Clear all conversation caches for this user
        pattern = f"messages:{user_id}:*"
        
    # Get all keys matching the pattern
    keys = redis_client.keys(pattern)
    if not keys:
        return 0
        
    # Delete all matching keys
    return redis_client.delete(*keys)

def invalidate_on_new_message(user_id, friend_id, message_id=None):
    """
    Invalidate cache when a new message is sent/received
    
    Args:
        user_id (int): The ID of the message sender
        friend_id (int): The ID of the message recipient
        message_id (int, optional): The ID of the new message
        
    Returns:
        bool: True if successful, False otherwise
    """
    return clear_message_cache(user_id, friend_id) > 0

import os
import redis
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# Get Redis configuration from environment variables with defaults
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', None)
REDIS_DB = int(os.getenv('REDIS_DB', 0))
REDIS_SSL = os.getenv('REDIS_SSL', 'False').lower() in ('true', '1', 't')
REDIS_URL = os.getenv('REDIS_URL', None)

# Set up Redis client with connection pooling
try:
    if REDIS_URL:
        # Use the Redis URL if provided (common for cloud deployments)
        redis_client = redis.from_url(
            REDIS_URL,
            decode_responses=True  # Automatically decode responses to Python strings
        )
    else:
        # Connect using individual parameters
        redis_client = redis.Redis(
            host=REDIS_HOST,
            port=REDIS_PORT,
            password=REDIS_PASSWORD,
            db=REDIS_DB,
            ssl=REDIS_SSL,
            decode_responses=True,
            socket_timeout=5,  # Timeout for socket operations
            socket_connect_timeout=5,  # Timeout for socket connections
        )
    
    # Test connection
    redis_client.ping()
    print(f"✅ Successfully connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
    
except redis.ConnectionError as e:
    print(f"❌ Failed to connect to Redis: {e}")
    # Initialize a dummy client that will raise errors on operations
    # This allows the application to start even if Redis is not available
    redis_client = None

# Optional convenience functions for common Redis operations
def set_with_expiry(key, value, expiry_seconds=3600):
    """Set a key with an expiry time."""
    if redis_client:
        return redis_client.setex(key, expiry_seconds, value)
    return False

def get_value(key):
    """Get a value from Redis."""
    if redis_client:
        return redis_client.get(key)
    return None

def delete_key(key):
    """Delete a key from Redis."""
    if redis_client:
        return redis_client.delete(key)
    return 0

def get_key_expiry(key):
    """Get the expiry time for a key."""
    if redis_client:
        return redis_client.ttl(key)
    return -2  # Redis returns -2 if the key doesn't exist

