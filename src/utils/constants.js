export const APP_LOGO = 
'https://help.nflxext.com/helpcenter/OneTrust/oneTrust_production_2025-08-26/consent/87b6a5c0-0104-4e96-a291-092c11350111/0198e689-25fa-7d64-bb49-0f7e75f898d2/logos/dd6b162f-1a32-456a-9cfe-897231c7763c/4345ea78-053c-46d2-b11e-09adaef973dc/Netflix_Logo_PMS.png'

export const PROFILE_RED_LOGO = 
'https://wallpapers.com/images/high/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.webp'

export const PROFILE_BLUE_LOGO ="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg"

export const API_OPTIONS ={
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer '+ process.env.REACT_APP_TMDB_API_KEY,
  }
};

export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w780/';
export const SUPPORTED_LANGUAGES = [{identifier: 'en', name: 'English'},
{identifier: 'hindi', name: 'Hindi'},
{identifier: 'spanish', name: 'Spanish'},
{identifier: 'marathi', name: 'Marathi'},
{identifier: 'konkani', name: 'Konkani'}];

export const APP_IMG_BG_URL = "https://assets.nflxext.com/ffe/siteui/vlv3/9ba9f0e2-b246-47f4-bd1f-3e84c23a5db8/web/IN-en-20251020-TRIFECTA-perspective_d6da84e9-6145-4b1e-bb51-e402c966a045_large.jpg";

export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;