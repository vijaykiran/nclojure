
var langserver = null;

exports.activate = function() {
    // Do work when the extension is activated
    langserver = new ClojureLanguageServer();
}

exports.deactivate = function() {
    // Clean up state before the extension is deactivated
    if (langserver) {
        langserver.deactivate();
        langserver = null;
    }
}

class ClojureLanguageServer {
    constructor() {
        // Observe the configuration setting for the server's location, and restart the server on change
        nova.config.observe('nclojure.language-server-path', function(path) {
            console.log("Starting at " + path);
            this.start(path);
        }, this);
    }

    deactivate() {
        this.stop();
    }

    start(path) {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
        }

        // Use the default server path
        if (!path) {
            path = '/usr/local/bin/clojure-lsp';
        }

        // Create the client
        var serverOptions = {
            path: path,
            args: ["--verbose"]
        };
        var clientOptions = {
            // The set of document syntaxes for which the server is valid
            syntaxes: ['Clojure']
        };
        console.log("starting server from " + path);

        var client = new LanguageClient('clojure', 'Clojure Language Server', serverOptions, clientOptions);

        try {
            // Start the client
            client.start();

            // Add the client to the subscriptions to be cleaned up
            nova.subscriptions.add(client);
            this.languageClient = client;
        }
        catch (err) {
            // If the .start() method throws, it's likely because the path to the language server is invalid
            if (nova.inDevMode()) {
                console.error(err);
            }
        }
    }

    stop() {
        if (this.languageClient) {
            this.languageClient.stop();
            nova.subscriptions.remove(this.languageClient);
            this.languageClient = null;
        }
    }
}

