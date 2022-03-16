import { use, should } from 'chai';

should();
// eslint-disable-next-line import/no-unresolved,node/no-missing-import
use((await import('chai-superagent')).default);
