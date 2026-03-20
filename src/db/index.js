import mongoose from "mongoose"

const connectRoomioDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/Roomio`)
        console.log(`\nMONGODB connected successfully : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB connection error", error)
        process.exit(1)
    }
}


export default connectRoomioDB 