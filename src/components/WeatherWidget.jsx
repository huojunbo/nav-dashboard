import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Snowflake, Wind, MapPin, AlertCircle, Droplets, Eye, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// WMO Weather codes to description
const getWeatherDescription = (code, t) => {
    const codes = {
        0: t('weather.codes.clear'),
        1: t('weather.codes.mainlyClear'),
        2: t('weather.codes.partlyCloudy'),
        3: t('weather.codes.overcast'),
        45: t('weather.codes.fog'),
        48: t('weather.codes.depositingRimeFog'),
        51: t('weather.codes.lightDrizzle'),
        53: t('weather.codes.moderateDrizzle'),
        55: t('weather.codes.denseDrizzle'),
        61: t('weather.codes.slightRain'),
        63: t('weather.codes.moderateRain'),
        65: t('weather.codes.heavyRain'),
        71: t('weather.codes.slightSnow'),
        73: t('weather.codes.moderateSnow'),
        75: t('weather.codes.heavySnow'),
        80: t('weather.codes.slightShowers'),
        81: t('weather.codes.moderateShowers'),
        82: t('weather.codes.violentShowers'),
        95: t('weather.codes.thunderstorm'),
        96: t('weather.codes.thunderstormWithHail'),
        99: t('weather.codes.thunderstormWithHeavyHail'),
    };
    return codes[code] || t('weather.codes.unknown');
};

const WeatherWidget = () => {
    const { t, i18n } = useTranslation();
    const [weather, setWeather] = useState(null);
    const [dailyForecast, setDailyForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState(t('weather.detectingLocation'));
    const [geoStatus, setGeoStatus] = useState('pending');
    const [fetchError, setFetchError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const [location, setLocation] = useState({ lat: null, lon: null });

    // 规范化语言用于第三方API
    const normalizeLang = (lang) => {
        if (!lang) return 'en';
        return String(lang).split('-')[0];
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoStatus('error');
            setLocationName(t('weather.locationNotSupported'));
            setLocation({ lat: 40.7128, lon: -74.0060 });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setGeoStatus('success');
                // 暂时显示坐标，稍后通过反向地理编码替换为地名
                setLocationName(`${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setGeoStatus('denied');
                        setLocationName(t('weather.locationDenied'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setGeoStatus('error');
                        setLocationName(t('weather.locationUnavailable'));
                        break;
                    default:
                        setGeoStatus('error');
                        setLocationName(t('weather.locationError'));
                }
                // 使用默认坐标并尝试反向地理编码
                setLocation({ lat: 40.7128, lon: -74.0060 });
            }
        );
    }, [t]);

    // 根据坐标查询地名（反向地理编码）
    useEffect(() => {
        const { lat, lon } = location;
        if (!lat || !lon) return;
        const controller = new AbortController();
        const fetchLocationName = async () => {
            try {
                // 直接使用 Nominatim 作为主要服务（更稳定，支持CORS）
                const osmParams = new URLSearchParams({
                    format: 'jsonv2',
                    lat: String(lat),
                    lon: String(lon),
                    'accept-language': i18n?.language || 'zh',
                });
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${osmParams.toString()}`, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'NavDashboard/1.0'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    const addr = data?.address || {};
                    // 优先显示城市名称
                    const city = addr.city || addr.town || addr.village || addr.county || addr.state || '';
                    const country = addr.country || '';

                    if (city && country) {
                        setLocationName(`${city} • ${country}`);
                    } else if (city) {
                        setLocationName(city);
                    } else if (country) {
                        setLocationName(country);
                    } else {
                        setLocationName(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
                    }
                } else {
                    // 如果失败，显示坐标
                    setLocationName(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    // 出错时显示坐标
                    setLocationName(`${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
                }
            }
        };
        fetchLocationName();
        return () => controller.abort();
    }, [location, i18n]);

    useEffect(() => {
        if (!location.lat || !location.lon) return;

        const fetchWeather = async () => {
            try {
                const params = new URLSearchParams({
                    latitude: location.lat,
                    longitude: location.lon,
                    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                    timezone: 'auto',
                    forecast_days: 5,
                });

                const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
                if (!response.ok) throw new Error(`API error: ${response.status}`);
                const data = await response.json();
                setWeather(data.current);
                setDailyForecast(data.daily);
                setFetchError(null);
            } catch (error) {
                setFetchError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [location]);

    const getWeatherIcon = (code) => {
        if (code === 0) return <Sun className="w-8 h-8 text-yellow-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-gray-300" />;
        if (code >= 45 && code <= 48) return <Cloud className="w-8 h-8 text-gray-400" />;
        if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
        if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-white" />;
        if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-300" />;
        if (code >= 95) return <CloudRain className="w-8 h-8 text-purple-400" />;
        return <Wind className="w-8 h-8 text-slate-400" />;
    };

    const getSmallIcon = (code) => {
        if (code === 0) return <Sun className="w-4 h-4 text-yellow-400" />;
        if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-gray-300" />;
        if (code >= 45 && code <= 48) return <Cloud className="w-4 h-4 text-gray-400" />;
        if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return <CloudRain className="w-4 h-4 text-blue-400" />;
        if (code >= 71 && code <= 77) return <Snowflake className="w-4 h-4 text-white" />;
        if (code >= 95) return <CloudRain className="w-4 h-4 text-purple-400" />;
        return <Wind className="w-4 h-4 text-slate-400" />;
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <div className="text-slate-400 animate-pulse">{t('weather.loading')}</div>
                <div className="text-xs text-slate-500">{locationName}</div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                    <div className="text-sm text-red-400">{t('weather.unavailable')}</div>
                    <div className="text-xs text-slate-500">{fetchError}</div>
                </div>
            </div>
        );
    }

    if (!weather) {
        return (
            <div className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <AlertCircle className="w-6 h-6 text-slate-400" />
                <div>
                    <div className="text-sm text-slate-400">{t('weather.noData')}</div>
                    <div className="text-xs text-slate-500">{locationName}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
            {/* Main Weather Display */}
            <div className="p-4">
                {/* Location - Now at the top and more prominent */}
                <div className="flex items-center gap-1.5 text-sm text-slate-300 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{locationName}</span>
                    {geoStatus === 'denied' && <span className="text-amber-400 text-xs">({t('weather.defaultLocation')})</span>}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>{getWeatherIcon(weather.weather_code)}</div>
                        <div>
                            <div className="text-3xl font-bold">{Math.round(weather.temperature_2m)}°C</div>
                            <div className="text-sm text-slate-400">{getWeatherDescription(weather.weather_code, t)}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        {expanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-white/10 p-4 space-y-4 animate-fade-in">
                    {/* Weather Details Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <div>
                                <div className="text-lg font-semibold">{weather.relative_humidity_2m}%</div>
                                <div className="text-xs text-slate-400">{t('weather.humidity')}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wind className="w-4 h-4 text-slate-400" />
                            <div>
                                <div className="text-lg font-semibold">{Math.round(weather.wind_speed_10m)} km/h</div>
                                <div className="text-xs text-slate-400">{t('weather.wind')}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Gauge className="w-4 h-4 text-purple-400" />
                            <div>
                                <div className="text-lg font-semibold">{Math.round(weather.pressure_msl)} hPa</div>
                                <div className="text-xs text-slate-400">{t('weather.pressure')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Feels Like */}
                    <div className="flex items-center gap-2 text-sm">
                        <Eye className="w-4 h-4 text-orange-400" />
                        <span className="text-slate-400">{t('weather.feelsLike')}: </span>
                        <span className="font-semibold">{Math.round(weather.apparent_temperature)}°C</span>
                    </div>

                    {/* 5-Day Forecast */}
                    {dailyForecast && (
                        <div className="pt-2">
                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">{t('weather.forecast')}</div>
                            <div className="grid grid-cols-5 gap-2">
                                {dailyForecast.time.slice(0, 5).map((date, index) => {
                                    const dayName = new Date(date).toLocaleDateString('zh-CN', { weekday: 'short' });
                                    return (
                                        <div key={date} className="text-center p-2 bg-white/5 rounded-lg">
                                            <div className="text-xs text-slate-400">{dayName}</div>
                                            <div className="my-1 flex justify-center">{getSmallIcon(dailyForecast.weather_code[index])}</div>
                                            <div className="text-xs">
                                                <span className="text-white">{Math.round(dailyForecast.temperature_2m_max[index])}°</span>
                                                <span className="text-slate-500"> / {Math.round(dailyForecast.temperature_2m_min[index])}°</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
