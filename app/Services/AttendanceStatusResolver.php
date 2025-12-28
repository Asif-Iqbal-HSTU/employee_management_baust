<?php

namespace App\Services;

class AttendanceStatusResolver
{
    public static function resolve(
        string $in,
        string $out,
        string $expectedIn,
        string $expectedOut
    ): string {

        $status = [];

        if ($in > $expectedIn) {
            $status[] = 'late entry';
        }

        if ($out < $expectedOut) {
            $status[] = 'early leave';
        }

        return $status ? implode(', ', $status) : 'ok';
    }
}
