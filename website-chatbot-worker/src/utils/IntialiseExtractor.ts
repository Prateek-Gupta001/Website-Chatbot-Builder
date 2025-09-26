
import { pipeline } from '@xenova/transformers';
import { FeatureExtractionPipeline } from '@xenova/transformers';

declare global {
    var extractor: Promise<FeatureExtractionPipeline>;
}

async function intialiseExtractor()
{
    const extractor = await pipeline("feature-extraction",'Xenova/bge-small-en-v1.5')
    return extractor
}

global.extractor = intialiseExtractor()