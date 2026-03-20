import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "menu": {
        "home": "Home",
        "movies": "Movies",
        "series": "TV Shows",
        "music": "Music",
        "livetv": "Live TV",
        "collections": "Collections",
        "search": "Search",
        "settings": "Settings",
        "logout": "Logout"
      },
      "common": {
        "watch": "Play",
        "resume": "Resume",
        "resume_from": "Resume ({{minutes}} min)",
        "featured": "Featured",
        "time_left_hm": "{{hours}}h {{mins}}m left",
        "time_left_m": "{{mins}}m left",
        "minutes": "{{count}} min",
        "played": "Played",
        "details": "Details",
        "back": "Back",
        "search_placeholder": "Search movies, actors, genres...",
        "premium_member": "Premium Member",
        "loading": "Loading...",
        "no_results": "No results found",
        "continue_watching": "Continue Watching",
        "no_continue_watching": "No items to continue watching",
        "start_watching_hint": "Start watching something and it will appear here"
      },
      "settings": {
        "title": "Settings",
        "appearance": "Appearance",
        "language": "Language",
        "theme": "Theme Color",
        "accent_purple": "Royal Purple",
        "accent_gold": "Golden Amber",
        "accent_emerald": "Emerald Green",
        "accent_rose": "Rose Pink",
        "save_login": "Save Login Information",
        "about": "About Obsidian",
        "version": "Version 1.0.0",
        "change_password": "Change Password",
        "new_password": "New Password",
        "confirm_password": "Confirm New Password",
        "pwd_len_err": "Password must be at least 6 characters",
        "pwd_match_err": "Passwords do not match",
        "pwd_fail": "Failed to change password, try again",
        "pwd_success": "Password changed successfully!",
        "cancel": "Cancel",
        "confirm": "Confirm"
      },
      "details": {
        "cast": "Cast & Crew",
        "similar": "More Like This",
        "overview": "Overview",
        "episode": "Episode {{number}} - {{name}}",
        "select_season": "Select a season to view episodes",
        "no_seasons": "No season information available"
      },
      "ai": {
      "agent": "AI Assistant",
      "model": "Model",
      "save_config": "Save Config",
      "clear": "Clear",
      "need_config": "Please configure AI model first",
      "config_btn": "Configure Model",
      "placeholder": "e.g. Click login, enter admin...",
      "executing": "Executing...",
      "execute": "Execute",
      "hint": "Enter natural language instructions to operate the UI"
},
      "modal": {
      "cancel": "Cancel",
      "confirm_logout": "Confirm Logout",
      "logout_msg": "You need to log in again to continue.",
      "switch_account": "Switch Account",
      "switch_msg": "Switching account will log you out of current session."
},
      "topbar": {
      "theme_mode": "Theme Mode",
      "settings": "Settings",
      "switch_account": "Switch Account",
      "logout": "Logout",
      "language": "Language"
},
      "sort": {
      "name": "Name",
      "date_added": "Date Added",
      "year": "Year",
      "rating": "Rating",
      "premiere_date": "Premiere Date",
      "asc": "Ascending",
      "desc": "Descending",
      "filter": "Filter"
},
      "library": {
      "movies": "Movies",
      "series": "TV Shows",
      "movies_desc": "Browse your movie collection",
      "series_desc": "Your favorite TV shows"
},
      "search": {
      "title": "Search",
      "desc": "Explore your library",
      "placeholder": "Search movies, tv shows, artists...",
      "press_enter": "Press Enter to search",
      "found": "Found",
      "results": "results",
      "query": "Search term:",
      "no_results": "No results for",
      "try_diff": "Try using different keywords",
      "start": "Start Searching",
      "start_desc": "Enter keywords to explore your library",
      "tags": [
            "Movies",
            "TV Shows",
            "Music",
            "Documentaries"
      ]
},
      "watch": {
      "skip_back": "Rewind {{sec}}s",
      "skip_forward": "Forward {{sec}}s",
      "info": "Playback Info",
      "settings": "Playback Settings",
      "skip_interval": "Skip Interval",
      "sec": "{{sec}}s",
      "now_playing": "Now Playing",
      "duration": "Duration",
      "format": "Format",
      "media_info": "Media Info",
      "basic_info": "Basic Info",
      "filename": "Filename",
      "container": "Container",
      "media_id": "Media Source ID",
      "video_stream": "Video Stream {{idx}}",
      "codec": "Codec",
      "resolution": "Resolution",
      "bitrate": "Bitrate",
      "framerate": "Framerate",
      "pixel_format": "Pixel Format",
      "aspect_ratio": "Aspect Ratio",
      "color_range": "Color Range",
      "audio_stream": "Audio Stream {{idx}}",
      "channels": "{{channels}} Channels",
      "samplerate": "Sample Rate",
      "language": "Language",
      "is_default": "Default",
      "yes": "Yes",
      "subtitle_stream": "Subtitle Stream {{idx}}",
      "no_streams": "No media stream info",
      "additional_info": "Additional Info",
      "play_method": "Play Method",
      "direct_play": "Direct Play",
      "transcode": "Transcoding",
      "media_type": "Media Type",
      "file_size": "File Size"
}
    }
  },
  zh: {
    translation: {
      "menu": {
        "home": "首页",
        "movies": "电影",
        "series": "剧集",
        "music": "音乐",
        "livetv": "直播电视",
        "collections": "合集",
        "search": "搜索",
        "settings": "设置",
        "logout": "退出登录"
      },
      "common": {
        "watch": "播放",
        "resume": "继续播放",
        "resume_from": "继续播放 ({{minutes}}分钟)",
        "featured": "精选",
        "time_left_hm": "剩余 {{hours}}小时 {{mins}}分钟",
        "time_left_m": "剩余 {{mins}}分钟",
        "minutes": "{{count}} 分钟",
        "played": "已观看",
        "details": "详情",
        "back": "返回",
        "search_placeholder": "搜索电影、演员、类型...",
        "premium_member": "高级会员",
        "loading": "加载中...",
        "no_results": "未找到结果",
        "continue_watching": "继续观看",
        "no_continue_watching": "暂无继续观看的内容",
        "start_watching_hint": "开始观看一些内容，它们会出现在这里"
      },
      "settings": {
        "title": "设置",
        "appearance": "外观",
        "language": "语言",
        "theme": "主题颜色",
        "accent_purple": "皇家紫",
        "accent_gold": "琥珀金",
        "accent_emerald": "祖母绿",
        "accent_rose": "玫瑰粉",
        "save_login": "保存登录信息",
        "about": "关于 Obsidian",
        "version": "版本 1.0.0",
        "change_password": "修改密码",
        "new_password": "新密码",
        "confirm_password": "确认新密码",
        "pwd_len_err": "密码长度至少为6位",
        "pwd_match_err": "两次输入的密码不一致",
        "pwd_fail": "密码更改失败，请重试",
        "pwd_success": "密码修改成功！",
        "cancel": "取消",
        "confirm": "确认修改"
      },
      "details": {
        "cast": "演职人员",
        "similar": "更多相似内容",
        "overview": "剧情简介",
        "episode": "第{{number}}集 - {{name}}",
        "select_season": "选择季数查看剧集",
        "no_seasons": "暂无季数信息"
      },
      "ai": {
      "agent": "AI 助手",
      "model": "模型",
      "save_config": "保存配置",
      "clear": "清除",
      "need_config": "请先配置 AI 模型以启用智能助手",
      "config_btn": "配置模型",
      "placeholder": "例如：点击登录按钮、填写用户名为 admin...",
      "executing": "执行中...",
      "execute": "执行",
      "hint": "输入自然语言指令，AI 将帮您操作界面"
},
      "modal": {
      "cancel": "取消",
      "confirm_logout": "确认退出",
      "logout_msg": "退出后需要重新登录才能继续使用",
      "switch_account": "切换账号",
      "switch_msg": "切换账号将退出当前登录状态"
},
      "topbar": {
      "theme_mode": "主题模式",
      "settings": "设置",
      "switch_account": "切换账号",
      "logout": "退出登录",
      "language": "语言"
},
      "sort": {
      "name": "名称",
      "date_added": "添加日期",
      "year": "年份",
      "rating": "评分",
      "premiere_date": "上映日期",
      "asc": "升序",
      "desc": "降序",
      "filter": "筛选"
},
      "library": {
      "movies": "电影",
      "series": "电视剧",
      "movies_desc": "浏览您的电影收藏",
      "series_desc": "您喜爱的剧集"
},
      "search": {
      "title": "搜索",
      "desc": "探索您的媒体库",
      "placeholder": "搜索电影、电视剧或艺术家...",
      "press_enter": "按 Enter 搜索",
      "found": "找到",
      "results": "个结果",
      "query": "搜索词:",
      "no_results": "没有找到",
      "try_diff": "尝试使用不同的关键词",
      "start": "开始搜索",
      "start_desc": "输入关键词探索您的媒体库",
      "tags": [
            "电影",
            "电视剧",
            "音乐",
            "纪录片"
      ]
},
      "watch": {
      "skip_back": "快退 {{sec}}秒",
      "skip_forward": "快进 {{sec}}秒",
      "info": "播放信息",
      "settings": "播放设置",
      "skip_interval": "快进/快退时长",
      "sec": "{{sec}}秒",
      "now_playing": "当前播放",
      "duration": "时长",
      "format": "格式",
      "media_info": "媒体信息",
      "basic_info": "基本信息",
      "filename": "文件名",
      "container": "容器格式",
      "media_id": "媒体源ID",
      "video_stream": "视频流 {{idx}}",
      "codec": "编码格式",
      "resolution": "分辨率",
      "bitrate": "比特率",
      "framerate": "帧率",
      "pixel_format": "像素格式",
      "aspect_ratio": "宽高比",
      "color_range": "色彩范围",
      "audio_stream": "音频流 {{idx}}",
      "channels": "{{channels}}声道",
      "samplerate": "采样率",
      "language": "语言",
      "is_default": "默认",
      "yes": "是",
      "subtitle_stream": "字幕流 {{idx}}",
      "no_streams": "无媒体流信息",
      "additional_info": "附加信息",
      "play_method": "播放方式",
      "direct_play": "直接播放",
      "transcode": "转码播放",
      "media_type": "媒体类型",
      "file_size": "文件大小"
}
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
