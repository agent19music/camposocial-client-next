"use client"

import React from 'react'
import { ReplyComponent } from './reply'
interface Reply {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
}
export const ReplyList = ({ replies }: { replies: Reply[] }) => {
  return (
    <div className="divide-y divide-border">
      {replies?.map((reply, index) => (
        <ReplyComponent
          key={index}
          reply={reply}
        />
      ))}
    </div>
  )
}