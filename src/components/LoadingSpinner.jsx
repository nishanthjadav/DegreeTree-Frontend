const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="text-gray-600 font-medium">{text}</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 