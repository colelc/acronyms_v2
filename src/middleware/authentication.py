import jwt
from jwt import PyJWKClient
from src.logging.app_logger import AppLogger

class Authentication:
    def __init__(self, config):
        self.logger = AppLogger.get_logger()
        self.config = config

        self.auth_config = {
            "auth_cookie_name": self.config["auth_cookie_name"],
            "issuer": self.config["issuer"],
            "jwks_uri": self.config["jwks_uri"],
            "algorithm": self.config["algorithm"],
            "audience": self.config["audience"]
        }

    def validate_request(self, headers):
        """
        Given HTTP headers, extract JWT from cookies and validate.
        Return claims (dict) if valid, None if invalid.
        """
        try:
            cookie_header = headers.get("Cookie")
            if not cookie_header:
                return None

            JWT = self.extractJWT(cookie_header)
            if JWT is None:
                return None

            signing_key = self.extract_signing_key(JWT)

            claims = jwt.decode(
                JWT,
                key=signing_key.key,
                algorithms=[self.auth_config["algorithm"]],
                options={"verify_exp": True, "verify_iat": False},
                audience=self.auth_config["audience"],
                issuer=self.auth_config["issuer"]
            )
            return claims
        except Exception as e:
            self.logger.error(f"Auth failed: {e}")
            return None

    def extractJWT(self, cookieString: str):
        if not cookieString:
            return None
        cookies = cookieString.split(";")
        filtered = list(filter(lambda x: self.auth_config["auth_cookie_name"] in x, cookies))
        if not filtered:
            return None
        JWT = filtered[0].strip().replace(self.auth_config["auth_cookie_name"]+"=", "")
        return JWT

    def extract_signing_key(self, JWT: str):
        jwks_client = PyJWKClient(self.auth_config["jwks_uri"])
        return jwks_client.get_signing_key_from_jwt(JWT)