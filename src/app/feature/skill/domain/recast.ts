import z from 'zod';

import {
  DayOfWeekCoerce,
  DurationCoerce,
  LocalDateTimeCoerce,
  LocalTimeCoerce,
} from '../../../util/zod-joda';

/** リキャスト基準日時 */
export const RecastFromBrand = Symbol();
export const RecastFrom = LocalDateTimeCoerce.brand<typeof RecastFromBrand>();
export type RecastFrom = z.output<typeof RecastFrom>;

/** リキャスト時間 */
export const RecastDurationBrand = Symbol();
export const RecastDuration = DurationCoerce.refine((it) => !it.isNegative() && !it.isZero()).brand<
  typeof RecastDurationBrand
>();
export type RecastDuration = z.output<typeof RecastDuration>;

/** リキャスト完了時刻 */
export const CompletedTimeBrand = Symbol();
export const CompletedTime = LocalTimeCoerce.brand<typeof CompletedTimeBrand>();
export type CompletedTime = z.output<typeof CompletedTime>;

/** リキャスト完了曜日 */
export const CompletedDayOfWeekBrand = Symbol();
export const CompletedDayOfWeek = DayOfWeekCoerce.brand<typeof CompletedDayOfWeekBrand>();
export type CompletedDayOfWeek = z.output<typeof CompletedDayOfWeek>;

/** リキャスト完了日時 */
export const CompletedAtBrand = Symbol();
export const CompletedAt = LocalDateTimeCoerce.brand<typeof CompletedAtBrand>();
export type CompletedAt = z.output<typeof CompletedAt>;

/** インターバル日数 */
export const IntervalDaysBrand = Symbol();
export const IntervalDays = z.number().min(0).brand<typeof IntervalDaysBrand>();
export type IntervalDays = z.output<typeof IntervalDays>;

/** インターバル週数 */
export const IntervalWeeksBrand = Symbol();
export const IntervalWeeks = z.number().min(0).brand<typeof IntervalWeeksBrand>();
export type IntervalWeeks = z.output<typeof IntervalWeeks>;

/** リキャストタイプ */
export const RecastType = z.enum(['duration', 'daily', 'weekly', 'manual']);
export type RecastType = z.output<typeof RecastType>;

/** 時間によるリキャスト */
export const DurationRecastBrand = Symbol();
export const DurationRecast = z
  .strictObject({
    /** リキャストタイプ */
    recastType: z.literal(RecastType.enum.duration),
    /** リキャスト時間 */
    recastDuration: RecastDuration,
  })
  .brand<typeof DurationRecastBrand>()
  .readonly();
export type DurationRecast = z.output<typeof DurationRecast>;

/** 日によるリキャスト */
export const DailyRecastBrand = Symbol();
export const DailyRecast = z
  .strictObject({
    /** リキャストタイプ */
    recastType: z.literal(RecastType.enum.daily),
    /** リキャスト完了時刻 */
    completedTime: CompletedTime,
    /** インターバル日数 */
    intervalDays: IntervalDays,
  })
  .brand<typeof DailyRecastBrand>()
  .readonly();
export type DailyRecast = z.output<typeof DailyRecast>;

/** 週によるリキャスト */
export const WeeklyRecastBrand = Symbol();
export const WeeklyRecast = z
  .strictObject({
    /** リキャストタイプ */
    recastType: z.literal(RecastType.enum.weekly),
    /** リキャスト完了曜日 */
    completedDayOfWeek: CompletedDayOfWeek,
    /** リキャスト完了時刻 */
    completedTime: CompletedTime,
    /** インターバル週数 */
    intervalWeeks: IntervalWeeks,
  })
  .brand<typeof WeeklyRecastBrand>()
  .readonly();
export type WeeklyRecast = z.output<typeof WeeklyRecast>;

/** 手動によるリキャスト */
export const ManualRecastBrand = Symbol();
export const ManualRecast = z
  .strictObject({
    /** リキャストタイプ */
    recastType: z.literal(RecastType.enum.manual),
  })
  .brand<typeof ManualRecastBrand>()
  .readonly();
export type ManualRecast = z.output<typeof ManualRecast>;

/** 時間経過によるリキャスト */
export const TimeBasedRecast = z.discriminatedUnion('recastType', [
  DurationRecast,
  DailyRecast,
  WeeklyRecast,
]);
export type TimeBasedRecast = z.output<typeof TimeBasedRecast>;

/** 時間経過によらないリキャスト */
export const NonTimeBasedRecast = z.discriminatedUnion('recastType', [ManualRecast]);
export type NonTimeBasedRecast = z.output<typeof NonTimeBasedRecast>;

/** リキャスト */
export const Recast = z.discriminatedUnion('recastType', [TimeBasedRecast, NonTimeBasedRecast]);
export type Recast = z.output<typeof Recast>;
