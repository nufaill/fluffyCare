import { PetCareLayout } from "../../components/layout/PetCareLayout"
import { ScheduleCalendar } from "../../components/shop/slot-calendar"
import {Navbar} from '@/components/shop/Navbar';


export default function ShopSchedulePage() {
  return (
    <PetCareLayout>
        <Navbar/>
      <ScheduleCalendar />
    </PetCareLayout>
  )
}
