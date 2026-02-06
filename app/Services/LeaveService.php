<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Holiday;

class LeaveService
{
    /**
     * Calculate leave days (Inclusive of holidays and weekends as per Sandwich Rule).
     */
    public static function calculateLeaveDays($startDate, $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($start->gt($end)) {
            return 0;
        }

        return $start->diffInDays($end) + 1;
    }

    public static function isWorkingDay(Carbon $date): bool
    {
        // Check if Friday (5) or Saturday (6)
        if ($date->dayOfWeek === Carbon::FRIDAY || $date->dayOfWeek === Carbon::SATURDAY) {
            return false;
        }

        // Check if holiday
        if (Holiday::where('date', $date->toDateString())->exists()) {
            return false;
        }

        return true;
    }

    /**
     * Check for 'Sandwich Rule' bridging.
     * If the requested leave is separated from another existing leave ONLY by holidays/weekends,
     * the gap must be legally counted as leave.
     * 
     * @return array ['start' => Carbon, 'end' => Carbon, 'bridged' => bool]
     */
    public static function getBridgedDates($employeeId, $startDate, $endDate) 
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $bridged = false;

        // 1. Backward Search (Left Bridge)
        $cursor = $start->copy()->subDay();
        while (!$cursor->isPast()) { // Safety break, though unlikely to go forever
            if (self::isWorkingDay($cursor)) {
                 // It's a working day. 
                 // If user has leave on this day, we bridge. 
                 // If user has NO leave, the bridge is broken (gap invalid).
                 $hasLeave = \App\Models\Leave::where('employee_id', $employeeId)
                    ->where('status', '!=', 'Denied') // Assuming there is a denied status? Or check active statuses
                    ->whereDate('start_date', '<=', $cursor)
                    ->whereDate('end_date', '>=', $cursor)
                    ->exists();
                
                 if ($hasLeave) {
                     // Found a connecting leave! All days from ($cursor + 1) to $start are gaps.
                     // The new start date becomes ($cursor + 1).
                     // Actually, if leave ends on $cursor, the gap starts at $cursor+1.
                     // Wait, if $cursor is a working day and has leave, then $cursor is LEAVE.
                     // The gap (holidays) is between $cursor and $start.
                     // So we extend our start to be $cursor + 1.
                     // No, wait. 
                     // Example: Leave ends Feb 3 (Mon). Feb 4 (Tue) Holiday. Req Start Feb 5 (Wed).
                     // Cursor starts at Feb 4. isWorkingDay? False. Loop.
                     // Cursor at Feb 3. isWorkingDay? True.
                     // Check Leave at Feb 3. Found.
                     // So Feb 4 was the gap.
                     // New Start should be Feb 4.
                     // So New Start = $cursor->copy()->addDay().
                     $start = $cursor->copy()->addDay();
                     $bridged = true;
                 }
                 break; // Stop searching backwards once we hit a working day (leave or not)
            }
            $cursor->subDay();
        }

        // 2. Forward Search (Right Bridge)
        $cursor = $end->copy()->addDay();
        // Limit forward search resonably (e.g. 1 month) to prevent infinite loops if configured wrong
        $limit = $end->copy()->addMonth(); 
        
        while ($cursor->lte($limit)) {
            if (self::isWorkingDay($cursor)) {
                $hasLeave = \App\Models\Leave::where('employee_id', $employeeId)
                    ->where('status', '!=', 'Denied') // Filter active/pending leaves
                    ->whereDate('start_date', '<=', $cursor)
                    ->whereDate('end_date', '>=', $cursor)
                    ->exists();

                if ($hasLeave) {
                    // Found connecting leave.
                    // Example: Req ends Feb 3. Feb 4 Holiday. Leave starts Feb 5.
                    // Cursor at Feb 4. Not Working.
                    // Cursor at Feb 5. Working. Has Leave? Yes.
                    // Gap is Feb 4.
                    // New End should be Feb 4.
                    // New End = $cursor->copy()->subDay().
                    $end = $cursor->copy()->subDay();
                    $bridged = true;
                }
                break; // Stop searching once hit working day
            }
            $cursor->addDay();
        }

        return [
            'start' => $start->format('Y-m-d'), 
            'end' => $end->format('Y-m-d'),
            'bridged' => $bridged
        ];
    }
}
