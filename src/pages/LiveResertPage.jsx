import React from 'react'
import LiveResert from '../components/LiveResert'
import BottomNavigation from '../components/BottomNavigation'

function LiveResertPage() {
  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <LiveResert/>
      </div>
      <BottomNavigation/>
    </div>
  )
}

export default LiveResertPage
