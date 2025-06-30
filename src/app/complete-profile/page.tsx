'use client';

import { useContext, useState } from 'react';
import { AuthContext } from '@/context/authcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export default function CompleteProfile() {
  const { completeProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    category: '',
    phone_no: '',
    display_name: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeProfile(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
            <option value="faculty">Faculty</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone_no">Phone Number</Label>
          <Input
            type="tel"
            name="phone_no"
            value={formData.phone_no}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            type="text"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Complete Profile
        </Button>
      </form>
    </div>
  );
}