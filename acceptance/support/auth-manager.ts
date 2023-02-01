import {OAuth2Server} from "oauth2-mock-server";
import ConfigurationProvider, {AuthConfig} from "../../src/lsrs/core/config/configuration-provider";
import {Scope} from "../../src/lsrs/web/model/common";

/**
 * Utility component for handling OAuth authorization mocking during Cucumber test execution.
 */
export default class AuthManager {

    private static authorizerMock: OAuth2Server;
    private static authConfig: AuthConfig;

    /**
     * Initializes the OAuth authorizer mock server.
     */
    public static async initAuthorizerMock() {

        if (!this.authorizerMock) {
            this.authConfig = (new ConfigurationProvider).getAuthConfig();

            this.authorizerMock = new OAuth2Server();
            this.authorizerMock.issuer.url = this.authConfig.oauthIssuer;
            await this.authorizerMock.issuer.keys.generate("RS256");
        }

        await this.authorizerMock.start(9999, "localhost");
    }

    /**
     * Creates an authorization header to be included in the REST calls.
     * The included token is signed by the mock authorization server.
     */
    public static async createAuthorizationHeader(scope: Scope[] = [Scope.READ_FILES, Scope.WRITE_FILES]): Promise<object> {

        const token = await this.authorizerMock.issuer.buildToken({
            scopesOrTransform: (header, payload) => {
                payload.iss = this.authConfig.oauthIssuer;
                payload.aud = this.authConfig.oauthAudience;
                payload.scope = scope.join(" ");
            }
        });

        return {
            Authorization: `Bearer ${token}`
        }
    }

    /**
     * Stops the OAuth authorizer mock server.
     */
    public static async stopAuthorizerMock() {
        await this.authorizerMock.stop();
    }
}