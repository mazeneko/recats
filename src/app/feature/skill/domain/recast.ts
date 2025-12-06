import z from 'zod';

import {
  DayOfWeekCoerce,
  DurationCoerce,
  LocalDateTimeCoerce,
  LocalTimeCoerce,
} from '../../../util/zod-joda';

/** リキャスト基準日時 */
export const RecastingFromBrand = Symbol();
export const RecastingFrom = LocalDateTimeCoerce.brand<typeof RecastingFromBrand>();
export type RecastingFrom = z.output<typeof RecastingFrom>;

/** リキャスト時間 */
export const RecastTimeBrand = Symbol();
export const RecastTime = DurationCoerce.refine((it) => !it.isNegative() && !it.isZero()).brand<
  typeof RecastTimeBrand
>();
export type RecastTime = z.output<typeof RecastTime>;

/** リキャスト完了時刻 */
export const AvailableAtBrand = Symbol();
export const AvailableAt = LocalTimeCoerce.brand<typeof AvailableAtBrand>();
export type AvailableAt = z.output<typeof AvailableAt>;

/** リキャスト日数 */
export const RecastDaysBrand = Symbol();
export const RecastDays = z.number().min(1).brand<typeof RecastDaysBrand>();
export type RecastDays = z.output<typeof RecastDays>;

/** リキャスト週数 */
export const RecastWeeksBrand = Symbol();
export const RecastWeeks = z.number().min(1).brand<typeof RecastWeeksBrand>();
export type RecastWeeks = z.output<typeof RecastWeeks>;

/** リキャスト曜日 */
export const RecastDayOfWeekBrand = Symbol();
export const RecastDayOfWeek = DayOfWeekCoerce.brand<typeof RecastDayOfWeekBrand>();
export type RecastDayOfWeek = z.output<typeof RecastDayOfWeek>;

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
    recastTime: RecastTime,
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
    /** リキャスト日数 */
    recastDays: RecastDays,
    /** リキャスト完了時刻 */
    availableAt: AvailableAt,
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
    /** リキャスト週数 */
    recastWeeks: RecastWeeks,
    /** リキャスト曜日 */
    recastDayOfWeek: RecastDayOfWeek,
    /** リキャスト完了時刻 */
    availableAt: AvailableAt,
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
