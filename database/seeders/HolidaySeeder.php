<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Holiday;
use Carbon\Carbon;

class HolidaySeeder extends Seeder
{
    public function run()
    {
        // Truncate existing holidays to avoid duplicates if run multiple times (optional, but good for idempotency)
        // Holiday::truncate(); // Commented out to be safe, using firstOrCreate instead

        $holidays = [
            ['date' => '2026-02-04', 'name' => 'Shab-E-Barat'],
            ['date' => '2026-02-21', 'name' => 'Shahid Dibosh & International Mother Language Day'],
            ['date' => '2026-03-17', 'name' => 'Shab-E-Qadar'],
            
            // Jumatul Bida & Eid-Ul-Fitr (19 March - 23 March)
            ['date' => '2026-03-19', 'name' => 'Jumatul Bida & Eid-Ul-Fitr'],
            ['date' => '2026-03-20', 'name' => 'Eid-Ul-Fitr Holiday'],
            ['date' => '2026-03-21', 'name' => 'Eid-Ul-Fitr Holiday'],
            ['date' => '2026-03-22', 'name' => 'Eid-Ul-Fitr Holiday'],
            ['date' => '2026-03-23', 'name' => 'Eid-Ul-Fitr Holiday'],

            ['date' => '2026-03-26', 'name' => 'Independence & National Day'],
            ['date' => '2026-04-13', 'name' => 'Chaitra Shankranti'],
            ['date' => '2026-04-14', 'name' => 'Bengali New Year'],
            ['date' => '2026-05-01', 'name' => 'May Day & Buddha Purnima'],
            
            // Eid-Ul-Azha (26 May - 31 May)
            ['date' => '2026-05-26', 'name' => 'Eid-Ul-Azha'],
            ['date' => '2026-05-27', 'name' => 'Eid-Ul-Azha Holiday'],
            ['date' => '2026-05-28', 'name' => 'Eid-Ul-Azha Holiday'],
            ['date' => '2026-05-29', 'name' => 'Eid-Ul-Azha Holiday'],
            ['date' => '2026-05-30', 'name' => 'Eid-Ul-Azha Holiday'],
            ['date' => '2026-05-31', 'name' => 'Eid-Ul-Azha Holiday'],
            
            ['date' => '2026-06-26', 'name' => 'Muharram (Ashura)'],
            ['date' => '2026-08-05', 'name' => 'July Uprising Day'],
            ['date' => '2026-08-26', 'name' => 'Eid-E-Milad-Un-Nabi'],
            ['date' => '2026-09-04', 'name' => 'Janmastami'],
            
            // Durgapuja (20 Oct - 21 Oct)
            ['date' => '2026-10-20', 'name' => 'Durgapuja'],
            ['date' => '2026-10-21', 'name' => 'Durgapuja'],
            
            ['date' => '2026-12-16', 'name' => 'Victory Day'],
            ['date' => '2026-12-25', 'name' => 'Christmas Day'],
        ];

        foreach ($holidays as $holiday) {
            Holiday::firstOrCreate(
                ['date' => $holiday['date']], // Search criteria
                ['name' => $holiday['name']]  // Values if not found
            );
        }
    }
}
