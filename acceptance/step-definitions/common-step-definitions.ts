import ApplicationManager from "@acceptance/support/application-manager";
import AuthManager from "@acceptance/support/auth-manager";
import DataRegistry from "@acceptance/support/data-registry";
import DatasourceManager from "@acceptance/support/datasource-manager";
import { HealthResponse } from "@app/web/model/actuator";
import { HttpStatus } from "@app/web/model/common";
import { After, AfterAll, BeforeAll, Then } from "@cucumber/cucumber";
import { AxiosResponse } from "axios";
import { expect } from "expect";

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
