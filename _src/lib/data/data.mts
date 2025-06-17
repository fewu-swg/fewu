import { PageContainer, Post } from "#lib/types";
import { DataStorage as DataStorageInterface } from "@fewu-swg/abstract-types";

class DataStorage implements DataStorageInterface {
    tags: PageContainer[] = [];
    categories: PageContainer[] = [];
    posts: Post[] = [];
    // Experimental
    sources: Record<string, Post> = {};
}

export default DataStorage;