import React from 'react'
import Live from '../components/Live'
import BottomNavigation from '../components/BottomNavigation'

function LivePage() {
  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <Live/>
      </div>
      <BottomNavigation/>
    </div>
  )
}

export default LivePage
