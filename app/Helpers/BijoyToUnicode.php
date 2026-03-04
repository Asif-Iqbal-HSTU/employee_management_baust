<?php

namespace App\Helpers;

/**
 * Converts Bijoy (SutonnyMJ) encoded text to Unicode Bengali.
 *
 * Based on the work by Habib Ullah Bahar (https://github.com/bahar/BijoyToUnicode)
 * Original JS character mapping by Abdullah Ibne Alam.
 * Licensed under AGPL-3.0.
 */
class BijoyToUnicode
{
    private static array $preConversionMap = [
        'yy' => 'y',
        'vv' => 'v',
        '­­' => '­',
        'y&' => 'y',
        '„&' => '„',
        '‡u' => 'u‡',
        'wu' => 'uw',
    ];

    private static array $conversionMap = [
        // Vowels
        'Av' => 'আ',
        'A' => 'অ',
        'B' => 'ই',
        'C' => 'ঈ',
        'D' => 'উ',
        'E' => 'ঊ',
        'F' => 'ঋ',
        'G' => 'এ',
        'H' => 'ঐ',
        'I' => 'ও',
        'J' => 'ঔ',
        // Consonants
        'K' => 'ক',
        'L' => 'খ',
        'M' => 'গ',
        'N' => 'ঘ',
        'O' => 'ঙ',
        'P' => 'চ',
        'Q' => 'ছ',
        'R' => 'জ',
        'S' => 'ঝ',
        'T' => 'ঞ',
        'U' => 'ট',
        'V' => 'ঠ',
        'W' => 'ড',
        'X' => 'ঢ',
        'Y' => 'ণ',
        'Z' => 'ত',
        '_' => 'থ',
        '`' => 'দ',
        'a' => 'ধ',
        'b' => 'ন',
        'c' => 'প',
        'd' => 'ফ',
        'e' => 'ব',
        'f' => 'ভ',
        'g' => 'ম',
        'h' => 'য',
        'i' => 'র',
        'j' => 'ল',
        'k' => 'শ',
        'l' => 'ষ',
        'm' => 'স',
        'n' => 'হ',
        'o' => 'ড়',
        'p' => 'ঢ়',
        'q' => 'য়',
        'r' => 'ৎ',
        's' => 'ং',
        't' => 'ঃ',
        'u' => 'ঁ',
        // Numbers
        '0' => '০',
        '1' => '১',
        '2' => '২',
        '3' => '৩',
        '4' => '৪',
        '5' => '৫',
        '6' => '৬',
        '7' => '৭',
        '8' => '৮',
        '9' => '৯',
        // Kars
        '•' => 'ঙ্',
        'v' => 'া',
        'w' => 'ি',
        'x' => 'ী',
        'y' => 'ু',
        'z' => 'ু',
        '"' => 'ু',
        '–' => 'ু',
        '~' => 'ূ',
        'ƒ' => 'ূ',
        '‚' => 'ূ',
        '„„' => 'ৃ',
        '„' => 'ৃ',
        '…' => 'ৃ',
        '†' => 'ে',
        '‡' => 'ে',
        'ˆ' => 'ৈ',
        '‰' => 'ৈ',
        'Š' => 'ৗ',
        '\\|' => '।',
        '\\&' => '্‌',
        '&' => '্',      // bare hoshonto (common in Excel data)
        // Jukto Okkhor (Conjuncts)
        '\\^' => '্ব',
        "\u{2018}" => '্তু',  // '
        "\u{2019}" => '্থ',  // '
        '‹' => '্ক',
        'Œ' => '্ক্র',
        "\u{201C}" => 'চ্',  // "
        '—' => '্ত',
        '˜' => 'দ্',
        '™' => 'দ্',
        'š' => 'ন্',
        '›' => 'ন্',
        'œ' => '্ন',
        'Ÿ' => '্ব',
        '¡' => '্ব',
        '¢' => '্ভ',
        '£' => '্ভ্র',
        '¤' => 'ম্',
        '¥' => '্ম',
        '¦' => '্ব',
        '§' => '্ম',
        '¨' => '্য',
        '©' => 'র্',
        'ª' => '্র',
        '«' => '্র',
        '¬' => '্ল',
        '­' => '্ল',
        '®' => 'ষ্',
        '¯' => 'স্',
        '°' => 'ক্ক',
        '±' => 'ক্ট',
        '²' => 'ক্ষ্ণ',
        '³' => 'ক্ত',
        '´' => 'ক্ম',
        'µ' => 'ক্র',
        '¶' => 'ক্ষ',
        '·' => 'ক্স',
        '¸' => 'গু',
        '¹' => 'জ্ঞ',
        'º' => 'গ্দ',
        '»' => 'গ্ধ',
        '¼' => 'ঙ্ক',
        '½' => 'ঙ্গ',
        '¾' => 'জ্জ',
        '¿' => '্ত্র',
        'À' => 'জ্ঝ',
        'Á' => 'জ্ঞ',
        'Â' => 'ঞ্চ',
        'Ã' => 'ঞ্ছ',
        'Ä' => 'ঞ্জ',
        'Å' => 'ঞ্ঝ',
        'Æ' => 'ট্ট',
        'Ç' => 'ড্ড',
        'È' => 'ণ্ট',
        'É' => 'ণ্ঠ',
        'Ê' => 'ণ্ড',
        'Ë' => 'ত্ত',
        'Ì' => 'ত্থ',
        'Í' => 'ত্ম',
        'Î' => 'ত্র',
        'Ï' => 'দ্দ',
        'Ð' => '-',
        'Ñ' => '-',
        'Ò' => '"',
        'Ó' => '"',
        'Ô' => "'",
        'Õ' => "'",
        'Ö' => '্র',
        '×' => 'দ্ধ',
        'Ø' => 'দ্ব',
        'Ù' => 'দ্ম',
        'Ú' => 'ন্ঠ',
        'Û' => 'ন্ড',
        'Ü' => 'ন্ধ',
        'Ý' => 'ন্স',
        'Þ' => 'প্ট',
        'ß' => 'প্ত',
        'à' => 'প্প',
        'á' => 'প্স',
        'â' => 'ব্জ',
        'ã' => 'ব্দ',
        'ä' => 'ব্ধ',
        'å' => 'ভ্র',
        'æ' => 'ম্ন',
        'ç' => 'ম্ফ',
        'è' => '্ন',
        'é' => 'ল্ক',
        'ê' => 'ল্গ',
        'ë' => 'ল্ট',
        'ì' => 'ল্ড',
        'í' => 'ল্প',
        'î' => 'ল্ফ',
        'ï' => 'শু',
        'ð' => 'শ্চ',
        'ñ' => 'শ্ছ',
        'ò' => 'ষ্ণ',
        'ó' => 'ষ্ট',
        'ô' => 'ষ্ঠ',
        'õ' => 'ষ্ফ',
        'ö' => 'স্খ',
        '÷' => 'স্ট',
        'ø' => 'স্ন',
        'ù' => 'স্ফ',
        'ú' => '্প',
        'û' => 'হু',
        'ü' => 'হৃ',
        'ý' => 'হ্ন',
        'þ' => 'হ্ম',
    ];

    private static array $proConversionMap = ['্্' => '্'];

    private static array $postConversionMap = [
        '০ঃ' => '০:',
        '১ঃ' => '১:',
        '২ঃ' => '২:',
        '৩ঃ' => '৩:',
        '৪ঃ' => '৪:',
        '৫ঃ' => '৫:',
        '৬ঃ' => '৬:',
        '৭ঃ' => '৭:',
        '৮ঃ' => '৮:',
        '৯ঃ' => '৯:',
        ' ঃ' => ' :',
        'অা' => 'আ',
        '্‌্‌' => '্‌',
    ];

    /**
     * Convert a Bijoy-encoded string to proper Unicode Bengali.
     */
    public static function convert(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        mb_internal_encoding('UTF-8');

        $text = self::doCharMap($text, self::$preConversionMap);
        $text = self::doCharMap($text, self::$conversionMap);
        $text = self::reArrange($text);
        $text = self::doCharMap($text, self::$postConversionMap);

        return $text;
    }

    private static function doCharMap(string $text, array $map): string
    {
        foreach ($map as $src => $dst) {
            $text = str_replace($src, $dst, $text);
        }
        return $text;
    }

    private static function mbCharAt(string $str, int $i): string
    {
        return mb_substr($str, $i, 1);
    }

    private static function subString(string $str, int $from, int $to): string
    {
        return mb_substr($str, $from, $to - $from);
    }

    private static function isBanglaPreKar(string $c): bool
    {
        return in_array($c, ['ি', 'ৈ', 'ে'], true);
    }

    private static function isBanglaPostKar(string $c): bool
    {
        return in_array($c, ['া', 'ো', 'ৌ', 'ৗ', 'ু', 'ূ', 'ী', 'ৃ'], true);
    }

    private static function isBanglaKar(string $c): bool
    {
        return self::isBanglaPreKar($c) || self::isBanglaPostKar($c);
    }

    private static function isBanglaBanjonborno(string $c): bool
    {
        return in_array($c, [
            'ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ',
            'ট', 'ঠ', 'ড', 'ঢ', 'ণ', 'ত', 'থ', 'দ', 'ধ', 'ন',
            'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ',
            'স', 'হ', 'ড়', 'ঢ়', 'য়', 'ৎ', 'ং', 'ঃ', 'ঁ',
        ], true);
    }

    private static function isBanglaHalant(string $c): bool
    {
        return $c === '্';
    }

    private static function isBanglaNukta(string $c): bool
    {
        return $c === 'ঁ';
    }

    private static function isSpace(string $c): bool
    {
        return in_array($c, [' ', "\t", "\n", "\r"], true);
    }

    private static function reArrange(string $str): string
    {
        $str = self::doCharMap($str, self::$proConversionMap);
        $len = mb_strlen($str);

        // Pass 1: Change refs (reph reordering)
        for ($i = 0; $i < $len; ++$i) {
            $len = mb_strlen($str);
            if ($i < $len - 1
                && self::mbCharAt($str, $i) === 'র'
                && self::isBanglaHalant(self::mbCharAt($str, $i + 1))
                && ($i === 0 || !self::isBanglaHalant(self::mbCharAt($str, $i - 1)))
            ) {
                $j = 1;
                while (true) {
                    if ($i - $j < 0) {
                        break;
                    }
                    if (self::isBanglaBanjonborno(self::mbCharAt($str, $i - $j))
                        && ($i - $j - 1 >= 0) && self::isBanglaHalant(self::mbCharAt($str, $i - $j - 1))
                    ) {
                        $j += 2;
                    } elseif ($j === 1 && self::isBanglaKar(self::mbCharAt($str, $i - $j))) {
                        $j++;
                    } else {
                        break;
                    }
                }
                $temp = self::subString($str, 0, $i - $j);
                $temp .= self::mbCharAt($str, $i);
                $temp .= self::mbCharAt($str, $i + 1);
                $temp .= self::subString($str, $i - $j, $i);
                $temp .= self::subString($str, $i + 2, $len);
                $str = $temp;
                $i += 1;
            }
        }

        $str = self::doCharMap($str, self::$proConversionMap);
        $len = mb_strlen($str);

        // Pass 2: Second ref pass + vowel reordering + pre-kar placement
        for ($i = 0; $i < $len; ++$i) {
            $len = mb_strlen($str);

            // reph with halant after
            if ($i < $len - 1
                && self::mbCharAt($str, $i) === 'র'
                && self::isBanglaHalant(self::mbCharAt($str, $i + 1))
                && ($i === 0 || !self::isBanglaHalant(self::mbCharAt($str, $i - 1)))
                && ($i + 2 < $len) && self::isBanglaHalant(self::mbCharAt($str, $i + 2))
            ) {
                $j = 1;
                while (true) {
                    if ($i - $j < 0) {
                        break;
                    }
                    if (self::isBanglaBanjonborno(self::mbCharAt($str, $i - $j))
                        && ($i - $j - 1 >= 0) && self::isBanglaHalant(self::mbCharAt($str, $i - $j - 1))
                    ) {
                        $j += 2;
                    } elseif ($j === 1 && self::isBanglaKar(self::mbCharAt($str, $i - $j))) {
                        $j++;
                    } else {
                        break;
                    }
                }
                $temp = self::subString($str, 0, $i - $j);
                $temp .= self::mbCharAt($str, $i);
                $temp .= self::mbCharAt($str, $i + 1);
                $temp .= self::subString($str, $i - $j, $i);
                $temp .= self::subString($str, $i + 2, $len);
                $str = $temp;
                $i += 1;
                continue;
            }

            // Vowel + HALANT + Consonant → HALANT + Consonant + Vowel
            if ($i > 0
                && self::mbCharAt($str, $i) === '্'
                && (self::isBanglaKar(self::mbCharAt($str, $i - 1)) || self::isBanglaNukta(self::mbCharAt($str, $i - 1)))
                && $i < $len - 1
            ) {
                $temp = self::subString($str, 0, $i - 1);
                $temp .= self::mbCharAt($str, $i);
                $temp .= self::mbCharAt($str, $i + 1);
                $temp .= self::mbCharAt($str, $i - 1);
                $temp .= self::subString($str, $i + 2, $len);
                $str = $temp;
            }

            // RA + HALANT + Vowel → Vowel + RA + HALANT
            if ($i > 0 && $i < $len - 1
                && self::mbCharAt($str, $i) === '্'
                && self::mbCharAt($str, $i - 1) === 'র'
                && ($i < 2 || self::mbCharAt($str, $i - 2) !== '্')
                && self::isBanglaKar(self::mbCharAt($str, $i + 1))
            ) {
                $temp = self::subString($str, 0, $i - 1);
                $temp .= self::mbCharAt($str, $i + 1);
                $temp .= self::mbCharAt($str, $i - 1);
                $temp .= self::mbCharAt($str, $i);
                $temp .= self::subString($str, $i + 2, $len);
                $str = $temp;
            }

            // Pre-kar to post format for Unicode
            if ($i < $len - 1
                && self::isBanglaPreKar(self::mbCharAt($str, $i))
                && !self::isSpace(self::mbCharAt($str, $i + 1))
            ) {
                $temp = self::subString($str, 0, $i);
                $j = 1;

                while (($i + $j) < $len - 1 && self::isBanglaBanjonborno(self::mbCharAt($str, $i + $j))) {
                    if (($i + $j + 1) < $len && self::isBanglaHalant(self::mbCharAt($str, $i + $j + 1))) {
                        $j += 2;
                    } else {
                        break;
                    }
                }

                $temp .= self::subString($str, $i + 1, $i + $j + 1);

                $l = 0;
                if (self::mbCharAt($str, $i) === 'ে' && ($i + $j + 1) < $len && self::mbCharAt($str, $i + $j + 1) === 'া') {
                    $temp .= 'ো';
                    $l = 1;
                } elseif (self::mbCharAt($str, $i) === 'ে' && ($i + $j + 1) < $len && self::mbCharAt($str, $i + $j + 1) === 'ৗ') {
                    $temp .= 'ৌ';
                    $l = 1;
                } else {
                    $temp .= self::mbCharAt($str, $i);
                }

                $temp .= self::subString($str, $i + $j + $l + 1, $len);
                $str = $temp;
                $i += $j;
            }

            // Nukta should be placed after kars
            if ($i < $len - 1
                && self::isBanglaNukta(self::mbCharAt($str, $i))
                && self::isBanglaPostKar(self::mbCharAt($str, $i + 1))
            ) {
                $temp = self::subString($str, 0, $i);
                $temp .= self::mbCharAt($str, $i + 1);
                $temp .= self::mbCharAt($str, $i);
                $temp .= self::subString($str, $i + 2, $len);
                $str = $temp;
            }
        }

        return $str;
    }
}
