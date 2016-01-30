module.exports = function (grunt) {

    grunt.initConfig({
        browserify: {
            default: {
                src: [],
                dest: 'dist/test/browserified.js',
                options: {
                    alias: [
                        './dist/test/PersistentStorage.test.js:PersistentStorage.test',
                        'node-storage-shim:node-storage-shim'
                    ]
                }
            }
        },
        mocha_phantomjs: {
            test: {
                src: [
                    'lib/test/PersistentStorage.test.html'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');

    grunt.registerTask('build-tests', 'bundles the files for test', ['browserify']);
    grunt.registerTask('test', 'runs tests using phantomjs', ['mocha_phantomjs']);
    grunt.registerTask('default', 'builds and runs the tests', ['build-tests', 'test']);
};
