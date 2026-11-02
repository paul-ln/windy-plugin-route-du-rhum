import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

import serve from 'rollup-plugin-serve';
import rollupSvelte from 'rollup-plugin-svelte';
import rollupSwc from 'rollup-plugin-swc3';
import rollupCleanup from 'rollup-plugin-cleanup';

import { less } from 'svelte-preprocess-less';
import sveltePreprocess from 'svelte-preprocess';

import { existsSync, readFileSync } from 'node:fs';

import { transformCodeToESMPlugin, keyPEM, certificatePEM } from '@windycom/plugin-devtools';

const useSourceMaps = true;

// Certificat local reconnu par Windows (voir README) ; à défaut, celui du template Windy.
const localCert = { key: '.cert/localhost-key.pem', cert: '.cert/localhost.pem' };
const httpsOptions =
    existsSync(localCert.key) && existsSync(localCert.cert)
        ? { key: readFileSync(localCert.key), cert: readFileSync(localCert.cert) }
        : { key: keyPEM, cert: certificatePEM };

const buildConfigurations = {
    src: {
        input: 'src/plugin.svelte',
        out: 'plugin',
    },
    example01: {
        input: 'examples/01-hello-world/plugin.svelte',
        out: 'example01/plugin',
    },
    example02: {
        input: 'examples/02-using-vanilla-js/plugin.svelte',
        out: 'example02/plugin',
    },
    example03: {
        input: 'examples/03-boat-tracker/plugin.svelte',
        out: 'example03/plugin',
    },
    example04: {
        input: 'examples/04-aircraft-range/plugin.svelte',
        out: 'example04/plugin',
    },
    example05: {
        input: 'examples/05-airspace-map/plugin.svelte',
        out: 'example05/plugin',
    },
    example06: {
        input: 'examples/06-foehn-chart/plugin.svelte',
        out: 'example06/plugin',
    },
    example07: {
        input: 'examples/07-meteoblue-meteograms/plugin.svelte',
        out: 'example07/plugin',
    },
};

const requiredConfig = process.env.CONFIG || 'src';
const { input, out } = buildConfigurations[requiredConfig];

export default {
    input,
    output: [
        {
            file: `dist/${out}.js`,
            format: 'module',
            sourcemap: true,
        },
        {
            file: `dist/${out}.min.js`,
            format: 'module',
            plugins: [rollupCleanup({ comments: 'none', extensions: ['ts'] }), terser()],
        },
    ],

    onwarn: () => {
        /* We disable all warning messages */
    },
    external: id => id.startsWith('@windy/'),
    watch: {
        include: ['src/**', 'examples/**'],
        exclude: 'node_modules/**',
        clearScreen: false,
    },
    plugins: [
        rollupSvelte({
            emitCss: false,
            preprocess: {
                style: less({
                    sourceMap: false,
                    math: 'always',
                }),
                script: data => {
                    const preprocessed = sveltePreprocess({ sourceMap: useSourceMaps });
                    return preprocessed.script(data);
                },
            },
        }),
        rollupSwc({
            include: ['**/*.ts', '**/*.svelte'],
            sourceMaps: useSourceMaps,
        }),
        resolve({
            browser: true,
            mainFields: ['module', 'jsnext:main', 'main'],
            preferBuiltins: false,
            dedupe: ['svelte'],
        }),
        commonjs(),
        transformCodeToESMPlugin(),
        process.env.SERVE !== 'false' &&
            serve({
                contentBase: 'dist',
                // '::' écoute en IPv6 et IPv4 : localhost se résout en ::1 sur ce poste
                host: '::',
                port: 9999,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    // Chrome exige ces en-têtes quand un site public (windy.com) appelle localhost
                    'Access-Control-Allow-Private-Network': 'true',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                },
                https: httpsOptions,
            }),
    ],
};
