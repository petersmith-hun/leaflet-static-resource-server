import {BeforeAll, Then, When} from "@cucumber/cucumber";
import {expect} from "expect";
import {HealthResponse, InfoResponse} from "../../src/lsrs/web/model/actuator";
import DataRegistry from "../support/data-registry";
import LSRSRestClient from "../support/lsrs-rest-client";

let restClient: LSRSRestClient;

// -- set up --
BeforeAll(async () => {
    restClient = await LSRSRestClient.getInstance();
});

// -- actions --
When("calling the health check endpoint", async () => {
    DataRegistry.putResponse(await restClient.callActuatorHealthEndpoint());
});

When("calling the application info endpoint", async () => {
    DataRegistry.putResponse(await restClient.callActuatorInfoEndpoint());
});

// -- assertions --
Then("the application status is {word}", (status: string) => {
    const response = DataRegistry.getResponse<HealthResponse>();
    expect(response.data.status).toBe(status);
});

Then(/^the reported application (name|abbreviation) is (.*)$/, (field: string, value: string) => {
    const response = DataRegistry.getResponse<InfoResponse>();
    // @ts-ignore
    expect(response.data.app[field]).toBe(value);
});
