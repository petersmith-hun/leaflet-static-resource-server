import {After, AfterAll, BeforeAll, Then} from "@cucumber/cucumber";
import {AxiosResponse} from "axios";
import {expect} from "expect";
import {HealthResponse} from "../../src/lsrs/web/model/actuator";
import {HttpStatus} from "../../src/lsrs/web/model/common";
import ApplicationManager from "../support/application-manager";
import AuthManager from "../support/auth-manager";
import DataRegistry from "../support/data-registry";
import DatasourceManager from "../support/datasource-manager";

// -- set up --
BeforeAll({timeout: 10000}, async () => {
    await ApplicationManager.start();
    await DatasourceManager.reInitDatabase();
    await AuthManager.initAuthorizerMock();
});

// -- tear down --
AfterAll(async () => {
    await AuthManager.stopAuthorizerMock();
    ApplicationManager.cleanUp();
});

After({tags: "@DirtiesDatabase"}, async () => {
    await DatasourceManager.reInitDatabase();
});

After({tags: "@DirtiesStorage"}, () => {
    ApplicationManager.prepareMockStorage();
});

After(() => {
    DataRegistry.reset();
});

// -- assertions --
Then("the application responds with HTTP status {word}", (status: string) => {
    const response: AxiosResponse<HealthResponse> = DataRegistry.getResponse();
    expect(response.status).toBe(HttpStatus[status as keyof typeof HttpStatus]);
});
