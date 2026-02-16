"use client"

import React from 'react'
import { ReplyComponent } from './reply'
import { Reply } from '@/types'

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