import ConfigurationProvider, { Acceptor } from "@app/core/config/configuration-provider";
import { FileInput, MIMEType } from "@app/core/model/file-input";

describe("Unit tests for Acceptor", () => {

    let configurationProvider: ConfigurationProvider;
    let imageAcceptor: Acceptor;
    let fileAcceptor: Acceptor;

    describe("Test scenarios for #accept", () => {

        configurationProvider = new ConfigurationProvider();
        imageAcceptor = findAcceptor(configurationProvider, "image");
        fileAcceptor = findAcceptor(configurationProvider, "other");

        const scenarios: {acceptor: Acceptor, fileMIME: string, accept: boolean}[] = [
            {acceptor: imageAcceptor, fileMIME: "image/png", accept: true},
            {acceptor: imageAcceptor, fileMIME: "image/jpg", accept: true},
            {acceptor: imageAcceptor, fileMIME: "image/gif", accept: true},
            {acceptor: imageAcceptor, fileMIME: "application/octet-stream", accept: false},
            {acceptor: imageAcceptor, fileMIME: "text/css", accept: false},
            {acceptor: fileAcceptor, fileMIME: "image/png", accept: false},
            {acceptor: fileAcceptor, fileMIME: "application/octet-stream", accept: true},
            {acceptor: fileAcceptor, fileMIME: "application/pdf", accept: true},
            {acceptor: fileAcceptor, fileMIME: "application/x-bzip", accept: false},
            {acceptor: fileAcceptor, fileMIME: "text/css", accept: false}
        ];

        scenarios.forEach(scenario => {
            it(`should ${scenario.acceptor.acceptedAs} acceptor accept file of type ${scenario.fileMIME} -> ${scenario.accept}`, () => {

                // given
                const fileInput = prepareFileInput(scenario.fileMIME);

                // when
                const result = scenario.acceptor.accept(fileInput);

                // then
                expect(result).toBe(scenario.accept);
            });

        });

        function prepareFileInput(mime: string): FileInput {

            return {
                contentType: new MIMEType(mime)
            } as unknown as FileInput;
        }
    });

    function findAcceptor(configurationProvider: ConfigurationProvider, acceptedAs: string): Acceptor {

        return configurationProvider.getStorageConfig().acceptors
            .find(acceptor => acceptor.acceptedAs == acceptedAs)!;
    }
});
