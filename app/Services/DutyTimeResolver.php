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

        return [
            'start' => $start,
            'end' => $end,
            'is_overnight' => $end < $start,
            'source' => 'office',
        ];
    }
}
