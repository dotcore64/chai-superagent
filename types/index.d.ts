// Definitions by: Wim Looman <https://github.com/Nemo157>
//                 Liam Jones <https://github.com/G1itcher>
//                 Federico Caselli <https://github.com/CaselIT>
//                 Bas Luksenburg <https://github.com/bas-l>
//                 Austin Cawley-Edwards <https://github.com/austince>
// TypeScript Version: 3.0
/// <reference types="chai" />
import * as request from 'superagent';

// Merge namespace with global chai
declare global {
    namespace Chai {
        interface Assertion {
            redirectTo(location: string|RegExp): Assertion;

            param(key: string, value?: string): Assertion;

            cookie(key: string, value?: string): Assertion;

            status(code: number): Assertion;

            statusCode(code: number): Assertion;

            header(key: string, value?: string | RegExp): Assertion;

            charset(charset: string): Assertion;

            headers: Assertion;
            json: Assertion;
            text: Assertion;
            html: Assertion;
            redirect: Assertion;
        }

        interface TypeComparison {
            ip: Assertion;
        }
    }
}

type chaiHttp = (chai: any, utils: any) => void;

declare function plugin({ strict }?: { strict?: boolean }): chaiHttp;

export default plugin;
