import React from 'react'
import Main from '../components/Main'
import BottomNavigation from '../components/BottomNavigation'

function MainPage() {
  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <Main/>
      </div>
      <BottomNavigation/>
    </div>
  )
}

export default MainPage
