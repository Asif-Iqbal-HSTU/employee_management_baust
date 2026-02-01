<?php

namespace App\Services;

use App\Models\DutyRoster;
use App\Models\OfficeTime;

class DutyTimeResolver
{
    public static function resolve(string $employeeId, string $date): array
    {
        // Highest priority: duty roster
        $roster = DutyRoster::where('employee_id', $employeeId)
            ->where('date', $date)
            ->first();

        if ($roster) {
            return [
                'start' => $roster->start_time,
                'end' => $roster->end_time,
                'is_overnight' => $roster->end_time < $roster->start_time,
                'source' => 'roster',
            ];
        }

        // Fallback: office time
        $office = OfficeTime::whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->first();

        $start = $office?->in_time ?? '08:00:00';
        $end = $office?->out_time ?? '14:30:00';

        // Cleanup Logic: Check if employee is a cleaner
        $user = \App\Models\User::with('assignment.designation')->find($employeeId);

        if (
            $user &&
            $user->assignment &&
            $user->assignment->designation &&
            stripos($user->assignment->designation->designation_name, 'Cleaner') !== false
        ) {
            // Logic: 
            // 08:00 -> 06:30 (90 mins earlier)
            // 08:30 -> 07:00 (90 mins earlier)
            // End time is always 13:30 for these cases per requirement.

            $start = \Carbon\Carbon::parse($start)->subMinutes(90)->format('H:i:s');
            $end = '13:30:00';
        }

        return [
            'start' => $start,
            'end' => $end,
            'is_overnight' => $end < $start,
            'source' => 'office',
        ];
    }
}
