import { View } from 'react-native';
import PageHeader from './components/PageHeader';
import ReviewCard from './components/cards/ReviewCard';

const reviewsArray = [
  {
    username: "Username",
    avatar: require("../assets/images/service-provider.jpg"),
    rating: 4,
    review: "Great service! The provider was punctual, professional, and did a fantastic job. Highly recommend!"
  },
];

const Reviews = () => {
  return (
    <View>
      <PageHeader title="Reviews" backRoute="/profile_serviceprovider" />
      {reviewsArray.map((item, idx) => (
        <ReviewCard
          key={idx}
          username={item.username}
          avatar={item.avatar}
          rating={item.rating}
          review={item.review}
        />
      ))}
    </View>
  );
};

export default Reviews;