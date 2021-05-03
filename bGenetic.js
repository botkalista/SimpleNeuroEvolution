class Genetic {



    /**
     * @param {GeneticEntity} a 
     * @param {GeneticEntity} b 
     * @param {number} mutationRate 
     */
    static crossover(a, b, mutationRate) {

        const wa = a.getWeightsData();
        const wb = b.getWeightsData();

        const childWeightsData = [];

        for (let i = 0; i < wa.length; i++) {
            const shape = wa[i].shape;
            const rawA = wa[i].data;
            const rawB = wb[i].data;
            const rawC = [];

            for (let j = 0; j < rawA.length; j++) {
                const r = Math.random();
                const mr = Math.random();
                let v = r < 0.5 ? rawA[j] : rawB[j];
                if (mr < mutationRate) v += (Math.random() - 0.5);
                rawC.push(v);
            }

            childWeightsData.push({ shape, data: rawC });

        }

        return childWeightsData;

    }




}

class GeneticEntity {

    constructor(i, h, o, l) {
        this.score = 0;
        this.brain = new NeuralNetwork(i, h, o, l);
    }

    predict(input) {
        const prediction = this.brain.predict(input);
        const data = prediction.dataSync();
        prediction.dispose();
        return data;
    }

    /**
     * @returns {{shape:any,data:[]}[]}
     */
    getWeightsData() {
        const result = [];
        const weights = this.brain.model.getWeights();
        weights.forEach(t => {
            const shape = t.shape;
            const data = t.dataSync();
            result.push({ shape, data });
        });
        return result;
    }

    setWeightData(wData) {
        const tensors = [];
        wData.forEach(l => {
            const { shape, data } = l;
            const tensor = tf.tensor(data, shape);
            tensors.push(tensor);
        });
        this.brain.model.setWeights(tensors);
        tensors.forEach(t => t.dispose())
    }


}