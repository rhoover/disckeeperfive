import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';


export default {
  input: {
    'dk-home': 'src/js/scripts/home.js',
    'dk-createcourse': 'src/js/scripts/createcourse.js',
    'dk-createplayer': 'src/js/scripts/createplayer.js',
    'dk-adjustpars': 'src/js/scripts/adjustpars.js',
    'dk-listcourses': 'src/js/scripts/listcourses.js',
    'dk-listplayers': 'src/js/scripts/listplayers.js',
    'dk-roundsetup': 'src/js/scripts/roundsetup.js',
    'dk-roundscoring': 'src/js/scripts/roundscoring.js',
    'dk-roundhistory': 'src/js/scripts/roundhistory.js',
    'dk-statistics': 'src/js/scripts/statistics.js'
  },
  output: {
    format: 'es',
    dir: 'dist/js/scripts',
    entryFileNames: '[name].js'
  },
  plugins: [nodeResolve(), terser()]
  // plugins: [nodeResolve()]
};