import React from 'react'
import Like from '../components/Like'
import BottomNavigation from '../components/BottomNavigation'

function LikePage() {
  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <Like/>
      </div>
      <BottomNavigation/>
    </div>
  )
}

export default LikePage
