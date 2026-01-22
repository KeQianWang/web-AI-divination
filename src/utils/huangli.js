import { Solar } from 'lunar-javascript';

const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

const pad2 = (value) => String(value).padStart(2, '0');

const ensureSuffix = (value, suffix) => {
    if (!value) return '';
    return value.endsWith(suffix) ? value : `${value}${suffix}`;
};

const normalizeList = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
};

const formatList = (items, max) => {
    if (!items.length) return '暂无';
    // const sliced = items.slice(0, max);
    // const text = sliced.join('、');
    const text = items.join('、');
    return items.length > max ? `${text}` : text;
};

const buildSummary = (yi, ji) => {
    if (yi.length && ji.length) {
        return `今日简评：宜${yi[0]}，忌${ji[0]}`;
    }
    if (yi.length) {
        return `今日简评：宜${yi[0]}`;
    }
    if (ji.length) {
        return `今日简评：忌${ji[0]}`;
    }
    return '今日简评：平常日';
};

export const getHuangliData = (date = new Date()) => {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    const solarDate = `${solar.getYear()}.${pad2(solar.getMonth())}.${pad2(solar.getDay())}`;

    const lunarMonth = ensureSuffix(lunar.getMonthInChinese(), '月');
    const lunarDay = lunar.getDayInChinese();
    const lunarYear = ensureSuffix(lunar.getYearInGanZhi(), '年');
    const lunarDateParts = `${lunarMonth}${lunarDay}`;
    const lunarDateSub = lunarDateParts
        ? `农历${lunarDateParts}${lunarYear ? ` · ${lunarYear}` : ''}`
        : '农历暂无';

    const weekInChinese =
        typeof solar.getWeekInChinese === 'function'
            ? solar.getWeekInChinese()
            : WEEK_LABELS[date.getDay()];
    const weekLabel = weekInChinese
        ? weekInChinese.startsWith('周')
            ? weekInChinese
            : `周${weekInChinese}`
        : '';

    const ganZhiYear = ensureSuffix(lunar.getYearInGanZhi(), '年');
    const ganZhiMonth = ensureSuffix(lunar.getMonthInGanZhi(), '月');
    const ganZhiDay = ensureSuffix(lunar.getDayInGanZhi(), '日');
    const xiu = ensureSuffix(lunar.getXiu(), '宿');
    const ganZhiParts = [ganZhiYear, ganZhiMonth, ganZhiDay].filter(Boolean);
    const ganZhiBase = ganZhiParts.join(' ');
    const ganZhiXiu = xiu ? `${ganZhiBase} · ${xiu}` : ganZhiBase || '暂无';

    const yi = normalizeList(lunar.getDayYi());
    const ji = normalizeList(lunar.getDayJi());
    const yiText = formatList(yi, 4);
    const jiText = formatList(ji, 4);
    const xingZuo = solar.getXingzuo()

    return {
        solarDate,
        lunarDateSub,
        weekLabel,
        ganZhiXiu,
        yiText ,
        jiText ,
        xingZuo,
        note: buildSummary(yi, ji),
    };
};
