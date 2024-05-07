import { MIMEType } from "@app/core/model/file-input";

describe("Unit tests for MIMEType", () => {

    describe("Test scenarios for #isWildcardSubType", () => {

        it("should return true if subtype is *", () => {

            // given
            const mimeType = new MIMEType("image/*");

            // when
            const result = mimeType.isWildcardSubType();

            // then
            expect(result).toBe(true);
        });

        it("should return false if subtype is anything else", () => {

            // given
            const mimeType = new MIMEType("image/png");

            // when
            const result = mimeType.isWildcardSubType();

            // then
            expect(result).toBe(false);
        });
    });

    describe("Test scenarios for #isCompatibleWith", () => {

        const scenarios: {baseMIME: string, otherMIME: string, expectedFlag: boolean}[] = [
            {baseMIME: "image/*", otherMIME: "image/png", expectedFlag: true},
            {baseMIME: "image/png", otherMIME: "image/*", expectedFlag: true},
            {baseMIME: "image/png", otherMIME: "image/jpg", expectedFlag: false},
            {baseMIME: "application/octet-stream", otherMIME: "image/png", expectedFlag: false},
            {baseMIME: "application/*", otherMIME: "application/octet-stream", expectedFlag: true},
        ];

        scenarios.forEach(scenario => {

            it(`should ${scenario.otherMIME} be compatible with ${scenario.baseMIME} -> ${scenario.expectedFlag}`, () => {

                // given
                const baseMIME = new MIMEType(scenario.baseMIME);
                const otherMIME = new MIMEType(scenario.otherMIME);

                // when
                const result = baseMIME.isCompatibleWith(otherMIME);

                // then
                expect(result).toBe(scenario.expectedFlag);
                expect(baseMIME.toString()).toBe(scenario.baseMIME);
                expect(otherMIME.toString()).toBe(scenario.otherMIME);
            });
        });
    });
});
