/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ID: 'Car1',
                Stat: 'Broken',
                Size: 5,
                Model: 'Toyota',
                AppraisedValue: 9300,
            },
            {
                ID: 'Car2',
                Stat: 'Broken',
                Size: 5,
                Model: 'Tesla',
                AppraisedValue: 44400,
            },
            {
                ID: 'Car3',
                Stat: 'Broken',
                Size: 3,
                Model: 'Renault',
                AppraisedValue: 43500,
            },
            {
                ID: 'Car4',
                Stat: 'Broken',
                Size: 3,
                Model: 'Peugeot',
                AppraisedValue: 12600,
            },
            {
                ID: 'Car5',
                Stat: 'Broken',
                Size: 5,
                Model: 'Peugeot',
                AppraisedValue: 5700,
            },
            {
                ID: 'Car6',
                Stat: 'Broken',
                Size: 5,
                Model: 'Citroen',
                AppraisedValue: 5800,
            },
            {
                ID: 'Car7',
                Stat: 'Broken',
                Size: 7,
                Model: 'Citroen',
                AppraisedValue: 3810,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, Stat, size, Model, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Stat: Stat,
            Size: size,
            Model: Model,
            AppraisedValue: appraisedValue,
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, Stat, size, Model, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Stat: Stat,
            Size: size,
            Model: Model,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the Model field of asset with given id in the world state.
    async TransferAsset(ctx, id, newModel) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldModel = asset.Model;
        asset.Model = newModel;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldModel;
    }

        // RepairAsset updates the Stat field of asset with given id in the world state.
    async RepairAsset(ctx, id) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldStat = asset.Stat;
        asset.Stat = 'Repaired';
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldStat;
    }

            // ControlAsset updates the Stat field of asset with given id in the world state.
    async ControlAsset(ctx, id) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldStat = asset.Stat;
        if (oldStat=='Repaired') {
            asset.Stat = 'Controlled';
        }
        else {
            throw new Error(`The asset ${id} is not Repaired`);
        }
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldStat;
    }

        // SoldAsset updates the Stat field of asset with given id in the world state.
    async SoldAsset(ctx, id, appraisedValue) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldStat = asset.Stat;
        const oldPrice = asset.AppraisedValue;
        if (oldStat=='Controlled') {
            asset.Stat = 'Sold';
            asset.AppraisedValue = appraisedValue;
        }
        else {
            throw new Error(`The asset ${id} is not Controlled`);
        }
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return appraisedValue;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
