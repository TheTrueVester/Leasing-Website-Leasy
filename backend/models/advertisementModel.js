import mongoose from 'mongoose';



const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
});

export const Advertisement = mongoose.model('Advertisement', advertisementSchema);
export default Advertisement;