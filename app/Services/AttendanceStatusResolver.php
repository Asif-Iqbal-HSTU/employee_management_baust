<?php

namespace App\Services;

class AttendanceStatusResolver
{
    public static function resolve(
        ?string $in,
        ?string $out,
        string $expectedIn,
        string $expectedOut
    ): string {

        if (!$in && !$out) {
            return 'absent';
        }

        $status = [];

        if ($in && $in > $expectedIn) {
            $status[] = 'late entry';
        }

        if ($out && $out < $expectedOut) {
            $status[] = 'early leave';
        }

        return $status ? implode(', ', $status) : 'ok';
    }
}
