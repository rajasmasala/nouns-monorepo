import { readPngFile } from 'node-libpng';
import { PNGCollectionEncoder } from '../src';
import { promises as fs } from 'fs';
import { expected } from './lib';
import { join } from 'path';
import { expect } from 'chai';

describe('PNGCollectionEncoder', () => {
  let encoder: PNGCollectionEncoder;

  beforeEach(() => {
    encoder = new PNGCollectionEncoder();
  });

  it('should run-length encode an image with no content', async () => {
    const name = 'empty';
    const [empty] = expected.parts;
    const image = await readPngFile(join(__dirname, `./lib/images/${name}.png`));

    const rle = encoder.encodeImage(name, image);
    expect(rle).to.equal(empty.data);
  });

  it('should run-length encode an image with content', async () => {
    const name = 'head-cone';
    const [, headCone] = expected.parts;
    const image = await readPngFile(join(__dirname, `./lib/images/${name}.png`));

    const rle = encoder.encodeImage(name, image);
    expect(rle).to.equal(headCone.data);
  });

  it('should write RLE image data to a file', async () => {
    const filename = 'test-data.json';
    const names = ['empty', 'head-cone'];
    for (const name of names) {
      const image = await readPngFile(join(__dirname, `./lib/images/${name}.png`));
      encoder.encodeImage(name, image);
    }
    await encoder.writeToFile(filename);

    const fileJSON = await fs.readFile(filename, 'utf8');
    const data = JSON.parse(fileJSON);

    expect(data).to.deep.equal(expected);

    await fs.unlink(filename);
  });
});
