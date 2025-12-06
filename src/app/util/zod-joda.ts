import { DayOfWeek, Duration, LocalDate, LocalDateTime, LocalTime, nativeJs } from '@js-joda/core';
import z from 'zod';

export const ZodLocalDate = z.custom<LocalDate>((it) => it instanceof LocalDate);
export const ZodLocalTime = z.custom<LocalTime>((it) => it instanceof LocalTime);
export const ZodLocalDateTime = z.custom<LocalDateTime>((it) => it instanceof LocalDateTime);
export const ZodDuration = z.custom<Duration>((it) => it instanceof Duration);
export const ZodDayOfWeek = z.custom<DayOfWeek>((it) => it instanceof DayOfWeek);
export const ZodDayOfWeekJSON = z.string().refine((it) => {
  try {
    DayOfWeek.valueOf(it);
    return true;
  } catch {
    return false;
  }
});

/**
 * なんらかの日付表現からLocalDateを作れるzodスキーマです。
 *
 * 以下の値をもとにできます。
 * - LocalDate
 * - 有効な日付のDate
 * - ISO形式の日付文字列
 */
export const LocalDateCoerce = z
  .union([ZodLocalDate, z.date(), z.iso.date()])
  .transform<LocalDate>((value) => {
    if (value instanceof LocalDate) {
      return value;
    }
    if (value instanceof Date) {
      return nativeJs(value).toLocalDate();
    }
    return LocalDate.parse(value);
  });

/**
 * なんらかの時刻表現からLocalTimeを作れるzodスキーマです。
 *
 * 以下の値をもとにできます。
 * - LocalTime
 * - 有効な日付のDate
 * - ISO形式の時刻文字列
 */
export const LocalTimeCoerce = z
  .union([ZodLocalTime, z.date(), z.iso.time()])
  .transform<LocalTime>((value) => {
    if (value instanceof LocalTime) {
      return value;
    }
    if (value instanceof Date) {
      return nativeJs(value).toLocalTime();
    }
    return LocalTime.parse(value);
  });

/**
 * なんらかの日時表現からLocalDateTimeを作れるzodスキーマです。
 *
 * 以下の値をもとにできます。
 * - LocalDateTime
 * - 有効な日付のDate
 * - ISO形式の日時文字列
 */
export const LocalDateTimeCoerce = z
  .union([ZodLocalDateTime, z.date(), z.iso.datetime()])
  .transform<LocalDateTime>((value) => {
    if (value instanceof LocalDateTime) {
      return value;
    }
    if (value instanceof Date) {
      return nativeJs(value).toLocalDateTime();
    }
    return LocalDateTime.parse(value);
  });

/**
 * なんらかの継続時間表現からDurationを作れるzodスキーマです。
 *
 * 以下の値をもとにできます。
 * - Duration
 * - ISO形式の継続時間文字列
 */
export const DurationCoerce = z
  .union([ZodDuration, z.iso.duration()])
  .transform<Duration>((value) => {
    if (value instanceof Duration) {
      return value;
    }
    return Duration.parse(value);
  });

/**
 * なんらかの曜日表現からDayOfWeekを作れるzodスキーマです。
 *
 * 以下の値をもとにできます。
 * - DayOfWeek
 * - 曜日文字列
 */
export const DayOfWeekCoerce = z
  .union([ZodDayOfWeek, ZodDayOfWeekJSON])
  .transform<DayOfWeek>((value) => {
    if (value instanceof DayOfWeek) {
      return value;
    }
    return DayOfWeek.valueOf(value);
  });
