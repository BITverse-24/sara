import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://pineapple:pineapple@cluster0.ijignp2.mongodb.net/?appName=Cluster0', { dbName: "sara" });

export default mongoose;
