interface JwtPayload {
  sub: string;
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  exp: number;
  [key: string]: any;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload part (the second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Return the parsed payload with proper typing
    return {
      sub: payload.sub,
      user_id: payload.user_id,
      username: payload.username,
      full_name: payload.full_name,
      role: payload.role,
      is_active: payload.is_active,
      exp: payload.exp,
      ...payload // Include any additional fields
    };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token);
  if (!payload) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};
