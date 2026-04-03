import { BackendType } from "@clarion-app/types";
import { rssTorrentsApi } from "./rssTorrentsApi";
import { Feeds } from "./Feeds";
import { Feed } from "./Feed";
import { Series } from "./Series";

export const backend: BackendType = { url: "http://localhost:8000", user: { id: "", name: "", email: ""} };

export const updateFrontend = (config: BackendType) => {
    backend.url = config.url;
    backend.user = config.user;
};

export {
    rssTorrentsApi,
    Feeds,
    Feed,
    Series,
};
