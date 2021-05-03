
class NeuralNetwork {

    constructor(inputShape, hiddenLayerSize, outputs) {
        /**
         * @type {import('@tensorflow/tfjs').Sequential}
         */
        this.model = tf.sequential();
        this.hiddenLayer = tf.layers.dense({
            units: hiddenLayerSize,
            activation: 'sigmoid',
            inputShape
        });
        this.outputLayer = tf.layers.dense({
            activation: 'sigmoid',
            units: outputs
        });
        this.model.add(this.hiddenLayer);
        this.model.add(this.outputLayer);



        this.data = { xs: [], ys: [] };
    }

    compile(learningRate = 0.1) {
        this.model.compile({
            optimizer: tf.train.sgd(learningRate),
            loss: 'meanSquaredError',
            metrics: ['accuracy']
        });
    }

    addData(x, y) {
        this.data.xs.push(x);
        this.data.ys.push(y);
    }

    async train(times, epochs = 10) {
        const xs = tf.tensor(this.data.xs);
        const ys = tf.tensor(this.data.ys);
        xs.print();
        ys.print();
        let firstLoss;
        let lastLoss;
        for (let i = 0; i < times; i++) {
            const res = await this.model.fit(xs, ys, { epochs, shuffle: true });
            if (!firstLoss) firstLoss = res.history.loss[0];
            lastLoss = res.history.loss[epochs - 1];
            console.log('Time: ' + i + ' Epoch: ' + i * epochs)
        }
        return {
            firstLoss,
            lastLoss,
            diff: lastLoss - firstLoss
        };
    }

    predict(x) {
        const t = tf.tensor([x]);
        const prediction = this.model.predict(t);
        t.dispose();
        return prediction;
    }

}