import React from 'react'
import Reservation from '../components/Reservation'
import BottomNavigation from '../components/BottomNavigation'

function ReservationPage() {
  return (
    <div className="page-wrapper">
      <div className="content-wrapper">
        <Reservation/>
      </div>
      <BottomNavigation/>
    </div>
  )
}

export default ReservationPage
