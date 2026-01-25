<?php

namespace App\Services;

class AttendanceStatusResolver
{
    public static function resolve(
        ?string $in,
        ?string $out,
        string $expectedIn,
        string $expectedOut,
        bool $isOvernight = false
    ): string {

        if (!$in && !$out) {
            return 'absent';
        }

        $status = [];

        // For string comparison "01:00" < "21:00" is true, but 01:00 is LATER than 21:00 in overnight context.
        // So we use logic: if overnight and time is "early morning", treat it as "after midnight".

        $inLate = false;
        if ($in) {
            if (!$isOvernight) {
                $inLate = $in > $expectedIn;
            } else {
                // Overnight: expected 21:00. 
                // Any time between 00:00 and noon is definitely later than 21:00.
                if ($in < '12:00:00') {
                    $inLate = true;
                } else {
                    $inLate = $in > $expectedIn;
                }
            }
        }

        if ($inLate) {
            $status[] = 'late entry';
        }

        $outEarly = false;
        if ($out) {
            if (!$isOvernight) {
                $outEarly = $out < $expectedOut;
            } else {
                // Overnight: expected 06:00 (next day).
                // If they punch out at 23:00 (same day), it's definitely early.
                if ($out > '12:00:00') {
                    $outEarly = true;
                } else {
                    $outEarly = $out < $expectedOut;
                }
            }
        }

        if ($outEarly) {
            $status[] = 'early leave';
        }

        return $status ? implode(', ', $status) : 'ok';
    }
}
