'use client'

import React, { useEffect } from 'react'
import '@google/model-viewer'

export default function GLBView({ url }) {
  useEffect(() => {
  
  }, [])

  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-xl overflow-hidden">
      <model-viewer
        src={url}
        alt="3D model"
        auto-rotate
        camera-controls
        ar
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
      ></model-viewer>
    </div>
  )
}

