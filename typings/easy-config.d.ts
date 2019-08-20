declare module "easy-config" {

    class Config {
        constructor();
        loadConfig(): Config;
        modify(modifications:Object): Config;
        unmodify(): Config;
        writeConfigFile(name: string, config: Object): Config;
        changeConfigFile(name: string, config: Object): Config;
        deleteConfigFile(name: string): Config;
        static extend(original: Object): Config;
        static extend(original: Object, extend?: Object, noClone?: boolean): any;
        getDefinedOptions(): Object;
        isProduction(): boolean;
        [key: string]: any;
    }

    export = Config;
}