1. ### Is it possible to use KNN for image processing?

    Yes, but not ideal. KNN is sensitive to the 'curse of dimensionality' and noise in high-dimensional image data. CNNs are much more effective at capturing spatial hierarchies.

2. ### Differentiate between K-Means and KNN algorithms?

    K-Means is an unsupervised clustering algorithm used to group similar data points. KNN is a supervised classification/regression algorithm that predicts labels based on the K-nearest neighbors.

3. ### Explain the terms Artificial Intelligence (AI) Machine Learning (ML) and Deep Learning?

    AI is the broad concept of machines acting intelligently. ML is a subset where machines learn from data. Deep Learning is a subset of ML using multi-layered neural networks.

4. ### What are the different types of Learning/ Training models in ML?

    The four main types are: Supervised Learning (labeled data), Unsupervised Learning (unlabeled data), Semi-supervised Learning, and Reinforcement Learning (reward-based).

5. ### What is the difference between deep learning and machine learning?

    ML requires manual feature engineering and works on smaller datasets. Deep Learning automates feature extraction via neural networks but requires massive data and GPU power.

6. ### What is the main key difference between supervised and unsupervised machine learning?

    Supervised learning uses labeled datasets to train algorithms to classify or predict outcomes. Unsupervised learning analyzes and clusters unlabeled datasets to find hidden patterns.

7. ### How do you select important variables while working on a data set?

    By using Filter methods (correlation), Wrapper methods (forward/backward selection), or Embedded methods (Lasso/Ridge regularization and Random Forest importance).

8. ### There are many machine learning algorithms till now. If given a data set how can one determine which algorithm to be used for that?

    Based on the problem type (regression/classification), the size/quality of the data, the requirement for interpretability versus accuracy, and by testing multiple baseline models.

9. ### How are covariance and correlation different from one another?

    Covariance indicates the direction of the linear relationship between variables. Correlation is a standardized version that measures both the strength and direction from -1 to 1.

10. ### State the differences between causality and correlation?

    Correlation describes a statistical association between two variables, while causality implies that one variable directly causes the change in the other.

11. ### We look at machine learning software almost all the time. How do we apply Machine Learning to Hardware?

    Through chip design optimization, predictive maintenance of hardware components, power management, and deploying quantized models on FPGAs or ASICs.

12. ### Explain One-hot encoding and Label Encoding. How do they affect the dimensionality of the given dataset?

    Label Encoding assigns an integer to each category (no dimension change). One-hot encoding creates a binary column for each category, increasing dimensionality significantly.

13. ### When does regularization come into play in Machine Learning?

    Regularization is used to prevent overfitting by adding a penalty term to the cost function, which shrinks the coefficients and simplifies the model.

14. ### What is Bias Variance and what do you mean by Bias-Variance Tradeoff?

    Bias is error from simplistic assumptions; Variance is error from over-complexity. The tradeoff is the process of finding the sweet spot that minimizes total error.

15. ### How can we relate standard deviation and variance?

    Variance is the average of the squared differences from the Mean. Standard deviation is the square root of the variance, expressed in the same units as the data.

16. ### What is the difference between a Test set and a Validation set?

    The validation set is used to tune hyperparameters and prevent overfitting during training. The test set is used only once at the end to evaluate the final model's performance.

17. ### Explain the Latent Variable Model?

    A Latent Variable Model relates a set of observable variables to a set of latent (hidden) variables that are not directly measured but inferred from the data.

18. ### What is the difference between Array and List?

    Arrays are fixed-size and store elements of the same type. Lists are dynamic, can grow in size, and often store elements of varying types depending on the language.

19. ### What is a Fourier Transform?

    A mathematical transform that decomposes a function or signal (usually in time) into its constituent frequencies (sine and cosine waves).

20. ### Explain the handling of missing or corrupted values in the given dataset.

    Common techniques include: 1. Deletion (removing rows/columns); 2. Mean/Median/Mode Imputation (filling with central values); 3. Predictive Imputation (using algorithms like KNN or MICE to estimate values); 4. Flagging (adding a binary variable to indicate missingness).

21. ### What is Time series?

    A Time Series is a sequence of data points recorded at specific, successive time intervals. It is used to analyze trends, seasonal variations, and cyclic patterns over time (e.g., stock prices, weather data).

22. ### What is a Box-Cox transformation?

    A statistical technique used to transform non-normal dependent variables into a normal distribution. it helps in stabilizing variance and making the data meet the assumptions of linear regression.

23. ### What is the difference between stochastic gradient descent (SGD) and gradient descent (GD)?

    GD calculates the gradient using the entire dataset (stable but slow). SGD calculates the gradient using only one random sample per iteration (faster and can escape local minima but with high oscillations).

24. ### What is the exploding gradient problem while using the back propagation technique?

    It occurs when large error gradients accumulate, resulting in very large updates to neural network weights during training. This makes the model unstable and unable to learn. It is often solved by gradient clipping.

25. ### Can you mention some advantages and disadvantages of decision trees?

    Advantages: Easy to interpret, handles both numerical and categorical data, requires little data preparation. Disadvantages: High risk of overfitting, unstable (small changes in data change the tree), and biased toward features with more levels.

26. ### Explain the differences between Random Forest and Gradient Boosting machines.

    Random Forest uses Bagging (building trees in parallel and averaging results) to reduce variance. Gradient Boosting uses Boosting (building trees sequentially, where each tree corrects the previous one's errors) to reduce bias.

27. ### What is a confusion matrix and why do you need it?

    A table used to evaluate the performance of a classification model. It shows True Positives, True Negatives, False Positives, and False Negatives, helping to calculate metrics like Accuracy, Precision, Recall, and F1-Score.

28. ### Whatâ€™s a Fourier transform?

    A mathematical tool that transforms a signal from its original domain (often time or space) into the frequency domain, showing the different frequencies that make up the signal.

29. ### What do you mean by Associative Rule Mining (ARM)?

    An unsupervised learning technique used to find interesting relationships or patterns between variables in large datasets, commonly used in market basket analysis (e.g., 'If a customer buys bread, they are likely to buy butter').

30. ### What is Marginalisation? Explain the process.

    A method in probability where you sum or integrate out one or more variables from a joint probability distribution to obtain a 'marginal' distribution of the remaining variables.

31. ### Explain the phrase â€œCurse of Dimensionalityâ€.

    As the number of features (dimensions) increases, the amount of data needed to generalize accurately grows exponentially. Data points become sparse, making distance-based algorithms like KNN less effective.

32. ### What is the Principle Component Analysis?

    An unsupervised dimensionality reduction technique that transforms high-dimensional data into a lower-dimensional form (Principal Components) while retaining as much variance (information) as possible.

33. ### Why is rotation of components so important in Principle Component Analysis (PCA)?

    Rotation (e.g., Varimax) is used to make the principal components easier to interpret by ensuring each original variable loads strongly onto only one or a few components.

34. ### What are outliers? Mention three methods to deal with outliers.

    Outliers are data points that differ significantly from other observations. Methods: 1. Trimming (removal); 2. Winsorization (capping at a percentile); 3. Transformation (e.g., Log transform) or using robust algorithms like Random Forest.

35. ### What is the difference between regularization and normalisation?

    Regularization (L1/L2) adds a penalty to the model complexity to prevent overfitting. Normalization scales individual samples or features to have a specific range (e.g., 0 to 1) to ensure features contribute equally.

36. ### Explain the difference between Normalization and Standardization.

    Normalization (Min-Max) scales data to a fixed range like [0, 1]. Standardization (Z-score) scales data to have a mean of 0 and a standard deviation of 1, which is less sensitive to outliers.

37. ### List the most popular distribution curves along with scenarios where you will use them in an algorithm.

    1. Normal (Linear Regression, PCA); 2. Bernoulli (Binary classification); 3. Poisson (Modeling frequency of events); 4. Binomial (Fixed number of trials).

38. ### How do we check the normality of a data set or a feature?

    Using visual methods like Q-Q plots and Histograms, or statistical tests like the Shapiro-Wilk test or Kolmogorov-Smirnov test.

39. ### What is Linear Regression?

    A supervised learning algorithm used to model the linear relationship between a dependent variable and one or more independent variables to predict continuous numerical values.

40. ### Differentiate between regression and classification.

    Regression predicts a continuous numerical output (e.g., price). Classification predicts a discrete categorical label or class (e.g., Spam vs. Not Spam).

41. ### What is target imbalance? How do we fix it? A scenario where you have performed target imbalance on data. Which metrics and algorithms do you find suitable to input this data onto?

    Target imbalance occurs when one class significantly outweighs the other. Fixes: SMOTE (oversampling), undersampling, or adjusting class weights. Suitable metrics: F1-score, Precision-Recall AUC (not accuracy). Suitable algorithms: Random Forest, XGBoost.

42. ### List all assumptions for data to be met before starting with linear regression.

    1. Linearity; 2. Independence of errors; 3. Homoscedasticity (constant variance); 4. Normality of residuals; 5. No Multicollinearity.

43. ### When does the linear regression line stop rotating or finds an optimal spot where it is fitted on data?

    When the Cost Function (e.g., Mean Squared Error) reaches its global minimum, meaning the sum of the squared differences between predicted and actual values is minimized.

44. ### Why is logistic regression a type of classification technique and not a regression? Name the function it is derived from?

    Because it predicts probabilities that are mapped to discrete classes (0 or 1) using a decision threshold. It is derived from the Sigmoid (or Logistic) function.

45. ### What could be the issue when the beta value for a certain variable varies way too much in each subset when regression is run on different subsets of the given dataset?

    This usually indicates high Multicollinearity, where independent variables are highly correlated, making the model coefficients (beta values) unstable and sensitive to small changes in data.

46. ### What does the term Variance Inflation Factor mean?

    VIF measures how much the variance of an estimated regression coefficient is increased due to multicollinearity. A VIF above 5 or 10 indicates high correlation between independent variables.

47. ### Which machine learning algorithm is known as the lazy learner, and why is it called so?

    K-Nearest Neighbors (KNN). It is called 'lazy' because it does not have a training phase; it simply stores the training data and performs all computations during the prediction phase.

48. ### How does the SVM algorithm deal with self-learning?

    SVM 'learns' by finding the optimal hyperplane that maximizes the margin between classes. In a soft-margin SVM, it learns to ignore certain misclassifications (outliers) to achieve better generalization.

49. ### What are Kernels in SVM? List popular kernels used in SVM along with a scenario of their applications.

    Kernels in SVM are used to map data into higher dimensions to find a linear separation when the data is not linearly separable in the original space. Popular kernels include: 1. Linear (for linearly separable data); 2. Polynomial (for polynomial boundaries); 3. RBF (Gaussian) (for complex, non-linear boundaries - very common); 4. Sigmoid (used in neural networks).

50. ### What is Kernel Trick in an SVM Algorithm?

    The Kernel Trick is a method that allows SVM to operate in a high-dimensional feature space without explicitly computing the coordinates of the data in that space. It uses a kernel function to calculate the dot product between data points in the higher dimension, avoiding the computational cost of transformation.

51. ### What are ensemble models? Explain how ensemble techniques yield better learning as compared to traditional classification ML algorithms.

    Ensemble models combine the predictions from multiple individual models (base learners) to produce a single, more accurate prediction. They yield better results by reducing variance (Bagging, e.g., Random Forest) or reducing bias (Boosting, e.g., XGBoost), and by leveraging the 'wisdom of the crowd' to overcome the limitations of any single model.

52. ### What are overfitting and underfitting? Why does the decision tree algorithm suffer often with overfitting problems?

    Overfitting occurs when a model learns the training data too well, including noise, resulting in poor generalization to new data. Underfitting occurs when a model is too simple to capture the underlying patterns. Decision trees often overfit because they can grow deep enough to perfectly memorize the training data, creating overly complex rules.

53. ### What is OOB error and how does it occur?

    OOB (Out-of-Bag) error is an estimate of the generalization error in ensemble methods like Random Forest. It occurs because, during bagging, each tree is trained on a bootstrap sample (about 2/3 of the data), leaving the remaining 1/3 (the OOB samples) unused for that tree. The OOB samples can then be used to evaluate the model's performance without needing a separate validation set.

54. ### Why boosting is a more stable algorithm as compared to other ensemble algorithms?

    Boosting is generally more stable than bagging because it sequentially builds models, focusing on correcting the errors of the previous ones. This iterative refinement process reduces bias effectively. While it can be sensitive to noisy data (leading to overfitting if not regularized), its sequential nature makes it more stable in reducing overall error compared to the parallel, independent nature of bagging.

55. ### How do you handle outliers in the data?

    Methods include: 1. Removal (if clearly errors); 2. Capping/Winsorization (setting values to a max/min percentile); 3. Transformation (e.g., log, square root) to reduce skewness; 4. Using robust algorithms (e.g., Random Forest, SVM) that are less sensitive to outliers.

56. ### List popular cross validation techniques.

    1. K-Fold Cross-Validation (most common); 2. Stratified K-Fold (for imbalanced data); 3. Leave-One-Out Cross-Validation (LOOCV); 4. Time Series Split (for sequential data); 5. Group K-Fold (for grouped data).

57. ### Is it possible to test for the probability of improving model accuracy without cross-validation techniques? If yes, please explain

    Yes, using a Hold-out Validation set. You split the data into training and testing sets (e.g., 80/20) before training. The test set acts as a proxy for future data. You can evaluate the model on this set to estimate accuracy improvement. However, this is less robust than cross-validation as the result depends heavily on the specific split.

58. ### Name a popular dimensionality reduction algorithm.

    Principal Component Analysis (PCA) is the most popular. Others include Linear Discriminant Analysis (LDA), t-SNE (for visualization), and Autoencoders.

59. ### How can we use a dataset without the target variable into supervised learning algorithms?

    We can use Unsupervised Learning techniques like Clustering (e.g., K-Means) to group similar data points, or Dimensionality Reduction (e.g., PCA) to find latent features. These features can then be used as inputs for supervised algorithms, or the clusters themselves can be treated as pseudo-labels.

60. ### List all types of popular recommendation systems? Name and explain two personalized recommendation systems along with their ease of implementation

    Types: 1. Collaborative Filtering; 2. Content-Based Filtering; 3. Hybrid Systems. Personalized Systems: 1. **Collaborative Filtering (User-Based/Item-Based):** Recommends items based on similar users' preferences or similar items. Ease: Easy to implement for basic versions, but suffers from the 'cold start' problem. 2. **Content-Based Filtering:** Recommends items similar to those the user liked in the past based on item features. Ease: Relatively easy, requires good feature engineering but no user interaction data.

61. ### How do we deal with sparsity issues in recommendation systems? How do we measure its effectiveness? Explain.

    Sparsity is handled using Matrix Factorization (SVD), Hybrid Filtering, or Deep Learning (NCF). Effectiveness is measured using RMSE/MAE for rating predictions, or Precision@K, Recall@K, and NDCG for ranking/recommendation quality.

62. ### Name and define techniques used to find similarities in the recommendation system.

    1. Cosine Similarity (measures the cosine of the angle between vectors); 2. Pearson Correlation (measures linear correlation); 3. Euclidean Distance (measures the straight-line distance between points).

63. ### State the limitations of Fixed Basis Function.

    Fixed Basis Functions (like Polynomial or Gaussian) are not adaptive to data; they suffer from the 'curse of dimensionality' as the number of basis functions grows exponentially with input dimensions.

64. ### Define and explain the concept of Inductive Bias with some examples.

    Inductive Bias is the set of assumptions a learner uses to predict outputs for unseen inputs. Examples: Linear Regression assumes a linear relationship; Decision Trees assume a hierarchical axis-aligned split structure.

65. ### Explain the term instance-based learning.

    A family of learning algorithms that, instead of performing explicit generalization, compares new problem instances with instances seen in training (stored in memory). Example: K-Nearest Neighbors (KNN).

66. ### Keeping train and test split criteria in mind, is it good to perform scaling before the split or after the split?

    After the split. You should fit the scaler only on the training data and then transform both train and test sets to prevent 'data leakage' from the test set into the training process.

67. ### Define precision, recall and F1 Score?

    Precision: Accuracy of positive predictions. Recall: Ability to find all positive instances. F1 Score: The harmonic mean of Precision and Recall, providing a balance between the two metrics.

68. ### Plot validation score and training score with data set size on the x-axis and another plot with model complexity on the x-axis.

    1. Learning Curve (Data size x-axis): Shows if the model needs more data. 2. Complexity Curve (Complexity x-axis): Shows the point of underfitting vs. overfitting (where validation error starts to rise).

69. ### What is Bayesâ€™ Theorem? State at least 1 use case with respect to the machine learning context?

    A mathematical formula for calculating conditional probability: P(A|B) = [P(B|A) * P(A)] / P(B). Use case: Naive Bayes classifier for spam detection or medical diagnosis.

70. ### What is Naive Bayes? Why is it Naive?

    It is a classification algorithm based on Bayes' Theorem. It is called 'Naive' because it assumes that all features are completely independent of each other, which is rarely true in real-world data.

71. ### Explain how a Naive Bayes Classifier works

    It calculates the posterior probability for each class based on the input features using Bayes' Theorem. The class with the highest probability is chosen as the final prediction.

72. ### What do the terms prior probability and marginal likelihood in context of Naive Bayes theorem mean?

    Prior Probability: The initial belief/probability of a class before seeing data. Marginal Likelihood: The total probability of the evidence (data) occurring across all possible classes.

73. ### Explain the difference between Lasso and Ridge?

    Ridge (L2) adds the squared magnitude of coefficients as a penalty, shrinking them toward zero. Lasso (L1) adds the absolute magnitude, which can shrink some coefficients to exactly zero, performing feature selection.

74. ### Whatâ€™s the difference between probability and likelihood?

    Probability quantifies the outcome given fixed parameters. Likelihood quantifies how well the parameters explain the observed data.

75. ### Why would you Prune your tree?

    To reduce the complexity of a Decision Tree and prevent overfitting. Pruning removes branches that provide little predictive power, leading to better generalization on unseen data.

76. ### Model accuracy or Model performance? Which one will you prefer and why?

    Model performance is preferred. Accuracy can be misleading (especially in imbalanced data). Performance covers specific metrics like F1, Precision, Recall, or AUC-ROC that align with business goals.

77. ### List the advantages and limitations of the Temporal Difference Learning Method.

    Advantages: Learns online without needing a full model of the environment. Limitations: Can be sensitive to step-size parameters and may converge slowly or oscillate in complex environments.

78. ### How would you handle an imbalanced dataset?

    Using resampling (SMOTE for oversampling, or undersampling), using cost-sensitive learning (class weights), or choosing robust metrics like F1-score and Precision-Recall curves.

79. ### Mention some of the EDA Techniques?

    1. Univariate analysis (histograms, boxplots); 2. Bivariate analysis (scatter plots, correlation matrices); 3. Missing value analysis; 4. Outlier detection.

80. ### Mention why feature engineering is important in model building and list out some of the techniques used for feature engineering.

    It creates better inputs for models to improve accuracy. Techniques: One-hot encoding, scaling, interaction features, polynomial features, and handling date-time components.

81. ### Differentiate between Statistical Modeling and Machine Learning?

    Statistical Modeling focuses on inferring relationships between variables and finding significance. Machine Learning focuses on making the most accurate predictions possible.

82. ### Differentiate between Boosting and Bagging?

    Bagging (Random Forest) builds models in parallel to reduce variance. Boosting (XGBoost) builds models sequentially, each correcting the errors of its predecessor to reduce bias.

83. ### What is the significance of Gamma and Regularization in SVM?

    Gamma defines how far the influence of a single training example reaches (low=far, high=close). Regularization (C) controls the trade-off between a smooth decision boundary and classifying training points correctly.

84. ### Define ROC curve work

    An ROC curve plots the True Positive Rate vs. False Positive Rate at various threshold settings. The Area Under the Curve (AUC) measures the model's ability to distinguish between classes.

85. ### What is the difference between a generative and discriminative model?

    Generative models learn the joint probability distribution P(x,y) (how data is generated). Discriminative models learn the conditional probability P(y|x) (how to distinguish between classes).

86. ### What are hyperparameters and how are they different from parameters?

    Parameters are learned from the data during training (e.g., weights). Hyperparameters are set manually before training to control the learning process (e.g., learning rate, K in KNN).

87. ### What is shattering a set of points? Explain VC dimension.

    A set of points is shattered if a model can correctly classify any possible labeling of them. The VC dimension is the maximum number of points that can be shattered by a hypothesis space.

88. ### What are some differences between a linked list and an array?

    Arrays have fixed size and O(1) random access. Linked lists have dynamic size and O(n) access time, but offer O(1) insertion/deletion if the node location is known.

89. ### What is the meshgrid () method and the contourf () method? State some usesof both.

    Meshgrid creates a coordinate matrix from coordinate vectors. Contourf plots filled contours. Together, they are used to visualize 3D surfaces or decision boundaries of ML models in 2D.

90. ### Describe a hash table.

    A data structure that stores key-value pairs. It uses a hash function to compute an index into an array of buckets or slots, from which the desired value can be found. It provides average O(1) time complexity for search, insert, and delete operations.

91. ### List the advantages and disadvantages of using Neural Networks.

    Advantages: Can model complex non-linear relationships, effective for unstructured data (images, audio), and can generalize well. Disadvantages: Requires massive data and compute power, lacks interpretability ('black box'), and is prone to overfitting if not regularized.

92. ### You have to train a 12GB dataset using a neural network with a machine which has only 3GB RAM. How would you go about it?

    Use 'Out-of-core learning' or 'Mini-batch training'. Instead of loading the entire dataset into RAM, use data generators (like ImageDataGenerator in Keras) to load and train on small batches of data from the disk sequentially.

93. ### What is an Array?

    A linear data structure that collects elements of the same data type stored in contiguous memory locations. It allows random access to elements using an index.

94. ### What are the advantages and disadvantages of using an Array?

    Advantages: Fast O(1) access time via index and memory efficiency. Disadvantages: Fixed size (cannot be resized easily) and expensive O(n) insertions or deletions since elements must be shifted.

95. ### What is Lists in Python?

    A built-in dynamic data structure in Python that can store a collection of items of different data types. Unlike arrays, lists are mutable and can be resized during runtime.

96. ### Explain Eigenvectors and Eigenvalues.

    An eigenvector is a non-zero vector that changes only by a scalar factor when a linear transformation is applied. That scalar factor is the eigenvalue. In ML, they are the foundation for PCA to find the directions of maximum variance.

97. ### How would you define the number of clusters in a clustering algorithm?

    Common methods include: 1. The Elbow Method (finding the 'k' where inertia decrease slows down); 2. Silhouette Score (measuring cluster separation); 3. Gap Statistic; 4. Business/domain requirements.

98. ### What are the performance metrics that can be used to estimate the efficiency of a linear regression model?

    1. Mean Squared Error (MSE); 2. Root Mean Squared Error (RMSE); 3. Mean Absolute Error (MAE); 4. R-squared (Coefficient of Determination) and Adjusted R-squared.

99. ### What is the default method of splitting in decision trees?

    For Classification trees, the default is usually Gini Impurity (CART) or Information Gain (C4.5/ID3). For Regression trees, it is typically Variance Reduction or Mean Squared Error (MSE).

100. ### How is p-value useful?

    A p-value helps determine the statistical significance of results. In ML, it is used in feature selection to test the null hypothesis that a feature has no effect on the target; a p-value < 0.05 typically suggests the feature is significant.

101. ### Can logistic regression be used for classes more than 2?

    Yes, using 'Multinomial Logistic Regression' or strategies like 'One-vs-Rest' (OvR) and 'One-vs-One' (OvO) to handle multi-class classification problems.

102. ### What are the hyperparameters of a logistic regression model?

    1. C (Inverse of regularization strength); 2. Penalty type (L1, L2, Elasticnet); 3. Solver (e.g., liblinear, lbfgs); 4. Maximum iterations (max_iter).

103. ### Name a few hyper-parameters of decision trees?

    1. Max depth (limit tree growth); 2. Min samples split (minimum samples to split a node); 3. Min samples leaf; 4. Criterion (Gini or Entropy); 5. Max features.

104. ### How to deal with multicollinearity?

    1. Remove highly correlated independent variables; 2. Use Principal Component Analysis (PCA) to create uncorrelated features; 3. Use Regularization (Ridge or Lasso); 4. Combine correlated variables into a single feature.

105. ### What is Heteroscedasticity?

    A condition in regression where the variance of the error terms (residuals) is not constant across all levels of the independent variables. It violates the assumptions of Linear Regression and can lead to inefficient estimates.

106. ### Is ARIMA model a good fit for every time series problem?

    No. ARIMA is best for stationary or transformable-to-stationary linear time series. It struggles with non-linear patterns, highly seasonal data (unless using SARIMA), or data with long-term dependencies like financial 'black swans'.

107. ### How do you deal with the class imbalance in a classification problem?

    1. Resampling (Oversampling minority/Undersampling majority); 2. Synthetic data generation (SMOTE); 3. Using appropriate metrics (F1-score, AUC-ROC); 4. Adjusting class weights in the algorithm.

108. ### What is the role of cross-validation?

    To assess the generalizability of a model and reduce bias. It involves partitioning data into 'k' subsets, training on 'k-1' and testing on the remaining one, ensuring every data point is used for both training and testing.

109. ### What is a voting model?

    An ensemble learning method that combines predictions from multiple models. 'Hard voting' picks the class with the most votes; 'Soft voting' averages the predicted probabilities of each class.

110. ### How to deal with very few data samples? Is it possible to make a model out of it?

    Yes, using: 1. Transfer Learning (fine-tuning a pre-trained model); 2. Data Augmentation; 3. Simpler models to avoid overfitting (Naive Bayes, Linear models); 4. Cross-validation to maximize data utility.

111. ### What are the hyperparameters of an SVM?

    1. C (Regularization parameter); 2. Kernel (Linear, RBF, Poly); 3. Gamma (Kernel coefficient for RBF/Poly); 4. Degree (for polynomial kernels).

112. ### What is Pandas Profiling?

    An open-source Python library that generates comprehensive Exploratory Data Analysis (EDA) reports from a DataFrame, including statistics, correlations, missing values, and distribution plots.

113. ### What impact does correlation have on PCA?

    PCA performs best when features are highly correlated because it aims to capture the maximum variance in fewer dimensions. If features are uncorrelated, PCA will not be able to effectively reduce dimensionality.

114. ### How is PCA different from LDA?

    PCA is an unsupervised method that finds directions of maximum variance regardless of class labels. LDA is a supervised method that finds directions that maximize separation between different classes.

115. ### What distance metrics can be used in KNN?

    1. Euclidean Distance (L2 norm); 2. Manhattan Distance (L1 norm); 3. Minkowski Distance; 4. Hamming Distance (for categorical data); 5. Cosine Similarity.

116. ### Which metrics can be used to measure correlation of categorical data?

    1. Chi-Square Test; 2. Cramerâ€™s V (measures strength of association); 3. Theilâ€™s U (Uncertainty Coefficient); 4. ANOVA (for categorical vs. continuous).

117. ### Which algorithm can be used in value imputation in both categorical and continuous categories of data?

    K-Nearest Neighbors (KNN Imputer) and MICE (Multivariate Imputation by Chained Equations). Random Forest (MissForest) is also highly effective for both data types.

118. ### When should ridge regression be preferred over lasso?

    Use Ridge when you have many features with small effects and you want to keep all of them. Use Lasso when you suspect only a few features are actually important, as Lasso can perform feature selection by shrinking coefficients to zero.

119. ### Which algorithms can be used for important variable selection?

    1. Lasso Regression (L1 penalty); 2. Random Forest/XGBoost (Feature Importance scores); 3. Recursive Feature Elimination (RFE); 4. Decision Trees.

120. ### What ensemble technique is used by Random forests?

    Random Forest uses Bagging (Bootstrap Aggregating). It builds multiple decision trees in parallel using different subsets of the data and features, then averages their results (for regression) or takes a majority vote (for classification).

121. ### What ensemble technique is used by gradient boosting trees?

    It uses Boosting. Specifically, it builds trees sequentially, where each new tree attempts to correct the errors (residuals) made by the previous trees.

122. ### If we have a high bias error what does it mean? How to treat it?

    High bias means the model is too simple and is underfitting the data. To treat it: 1. Use a more complex model; 2. Add more features; 3. Reduce regularization; 4. Increase the number of training iterations.

123. ### Which type of sampling is better for a classification model and why?

    Stratified Sampling is better because it ensures that each class is represented in the same proportion in both the training and test sets as it is in the original dataset, preventing bias toward the majority class.

124. ### What is a good metric for measuring the level of multicollinearity?

    Variance Inflation Factor (VIF). A VIF value above 5 or 10 is generally considered an indicator of high multicollinearity between independent variables.

125. ### When can be a categorical value treated as a continuous variable and what effect does it have when done so?

    When the categories have a meaningful order (ordinal data), like ratings 1-5. Treating them as continuous assumes equal distance between levels, which simplifies the model but may lose nuanced categorical relationships.

126. ### What is the role of maximum likelihood in logistic regression.

    Maximum Likelihood Estimation (MLE) is the method used to estimate the coefficients of the model. It seeks the parameter values that maximize the likelihood of observing the actual data given the model.

127. ### Which distance do we measure in the case of KNN?

    The most common is Euclidean Distance. Other distances include Manhattan, Minkowski, and Hamming distance (for categorical data).

128. ### What is a pipeline?

    A pipeline is a way to codify and automate the workflow of a machine learning project, ensuring that data preprocessing, feature engineering, and model training steps happen in a fixed, reproducible sequence.

129. ### Which sampling technique is most suitable when working with time-series data?

    Time-Series Split (or Walk-forward validation). Traditional random sampling is unsuitable because it breaks the chronological order; we must train on past data to predict future data.

130. ### What are the benefits of pruning?

    Pruning reduces the size of decision trees, which helps prevent overfitting, improves generalization on unseen data, and makes the model easier to interpret.

131. ### What is normal distribution?

    Also known as Gaussian distribution, it is a probability distribution that is symmetric about the mean, showing that data near the mean are more frequent in occurrence than data far from the mean.

132. ### What is the 68 per cent rule in normal distribution?

    It states that in a normal distribution, approximately 68% of the data falls within one standard deviation of the mean (34% on each side).

133. ### What is a chi-square test?

    A statistical test used to determine if there is a significant association between two categorical variables or to check if a sample distribution fits a theoretical distribution.

134. ### What is a random variable?

    A variable whose value is subject to variations due to chance (stochasticity). It can be discrete (countable values) or continuous (infinite values within a range).

135. ### What is the degree of freedom?

    The number of values in a final calculation that are free to vary. In statistics, it often relates to the sample size minus the number of parameters being estimated.

136. ### Which kind of recommendation system is used by amazon to recommend similar items?

    Item-to-Item Collaborative Filtering. It analyzes items that users have bought together in the past to recommend similar products based on user behavior patterns.

137. ### What is a false positive?

    A Type I error where the model incorrectly predicts the positive class when the actual result is negative (e.g., a healthy person diagnosed with a disease).

138. ### What is a false negative?

    A Type II error where the model incorrectly predicts the negative class when the actual result is positive (e.g., a sick person diagnosed as healthy).

139. ### What is the error term composed of in regression?

    It is composed of: 1. Bias (error from assumptions); 2. Variance (error from sensitivity to data fluctuations); and 3. Irreducible error (random noise inherent in the data).

140. ### Which performance metric is better R2 or adjusted R2?

    Adjusted R2 is better because it accounts for the number of predictors in the model. Unlike R2, it only increases if the new variable improves the model more than would be expected by chance.

141. ### Whatâ€™s the difference between Type I and Type II error?

    Type I error is a 'false alarm' (rejecting a true null hypothesis). Type II error is a 'miss' (failing to reject a false null hypothesis).

142. ### What do you understand by L1 and L2 regularization?

    L1 (Lasso) adds the absolute value of coefficients as a penalty, which can lead to sparse models (feature selection). L2 (Ridge) adds the squared value, which shrinks coefficients but keeps them non-zero.

143. ### Which one is better, Naive Bayes Algorithm or Decision Trees?

    It depends on the data. Naive Bayes is faster and works well with high-dimensional text data. Decision Trees are better for capturing complex interactions and non-linear relationships.

144. ### What do you mean by the ROC curve?

    The Receiver Operating Characteristic curve is a plot of the True Positive Rate (Sensitivity) against the False Positive Rate (1-Specificity) at various threshold settings.

145. ### What do you mean by AUC curve?

    AUC (Area Under the Curve) measures the entire two-dimensional area underneath the entire ROC curve. It provides an aggregate measure of performance across all possible classification thresholds.

146. ### What is log likelihood in logistic regression?

    It is the natural logarithm of the likelihood function. We maximize the log-likelihood because it is mathematically easier to work with than the raw likelihood and results in the same optimal parameters.

147. ### How would you evaluate a logistic regression model?

    Using metrics like Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and the AUC-ROC curve.

148. ### What are the advantages of SVM algorithms?

    SVM is effective in high-dimensional spaces, uses memory efficiently through support vectors, and is versatile due to the 'kernel trick' for non-linear data.

149. ### Why does XGBoost perform better than SVM?

    XGBoost is an ensemble method that handles missing values, provides built-in regularization to prevent overfitting, and is generally faster and more scalable for large, tabular datasets.

150. ### What is the difference between SVM Rank and SVR (Support Vector Regression)?

    SVR is used to predict continuous numerical values (regression). SVM Rank is a variation used for 'learning to rank' problems, where the goal is to predict the relative order or relevance of items.

151. ### What is the difference between the normal soft margin SVM and SVM with a linear kernel?

    A linear kernel specifies the shape of the decision boundary (a straight line). A soft margin is a configuration that allows some misclassifications to achieve better generalization on noisy data.

152. ### How is linear classifier relevant to SVM?

    SVM is fundamentally a linear classifier that finds the optimal hyperplane to separate classes. It becomes non-linear only when using the 'kernel trick' to map data into higher dimensions.

153. ### What are the advantages of using a naive Bayes for classification?

    It is extremely fast, easy to implement, works well with high-dimensional data (like text), and requires relatively little training data to perform well.

154. ### Are Gaussian Naive Bayes the same as binomial Naive Bayes?

    No. Gaussian NB assumes features follow a normal distribution (continuous data). Bernoulli (Binomial) NB is used for discrete data where features are binary (0 or 1).

155. ### What is the difference between the Naive Bayes Classifier and the Bayes classifier?

    The Bayes Classifier is the theoretically optimal classifier but requires knowing true probabilities. Naive Bayes is a practical implementation that assumes all features are independent.

156. ### In what real world applications is Naive Bayes classifier used?

    Commonly used in Spam filtering, Sentiment Analysis, Document Classification, and Real-time prediction systems due to its speed.

157. ### What do you understand by selection bias in Machine Learning?

    It occurs when the data used to train the model is not representative of the real-world population, leading to a model that performs poorly in production.

158. ### What do you understand by Precision and Recall?

    Precision measures the accuracy of positive predictions (True Positives / Predicted Positives). Recall measures the ability to find all actual positives (True Positives / Actual Positives).

159. ### What Are the Three Stages of Building a Model in Machine Learning?

    1. Model Building (preprocessing and algorithm selection); 2. Model Testing (evaluating on a test set); 3. Model Deployment (putting the model into production).

160. ### How Do You Design an Email Spam Filter in Machine Learning?

    1. Collect and clean email data; 2. Preprocess text (tokenization, stop-word removal); 3. Convert text to numbers (TF-IDF/Bag-of-Words); 4. Train a classifier (like Naive Bayes); 5. Evaluate and tune.

161. ### What is the difference between Entropy and Information Gain?

    Entropy measures the impurity or randomness in a dataset. Information Gain is the reduction in entropy achieved by splitting the dataset on a specific feature.

162. ### What are collinearity and multicollinearity?

    Collinearity is a high correlation between two independent variables. Multicollinearity occurs when three or more independent variables are highly correlated.

163. ### What is Kernel SVM?

    A type of SVM that uses a 'kernel function' to map non-linearly separable data into a higher-dimensional space where a linear hyperplane can separate the classes.

164. ### What is the process of carrying out a linear regression?

    1. Define the problem; 2. Collect and clean data; 3. Check assumptions (linearity, etc.); 4. Train the model (find best coefficients); 5. Evaluate using metrics like R-squared; 6. Predict.
