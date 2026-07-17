# Questionnaire and scoring audit

MindPop results are reflective and non-diagnostic. Convenient descriptive language in the interface is not a population norm or clinical cutoff.

## 1. Personality - BFI-10

The ten items match the BFI-10 order. Responses remain on a 1-5 scale.

Reverse-keyed items: 1, 3, 4, 5 and 7.

Each domain is the mean of its keyed pair:

- Extraversion: 1R and 6
- Agreeableness: 2 and 7R
- Conscientiousness: 3R and 8
- Emotional reactivity / Neuroticism: 4R and 9
- Openness: 5R and 10

The previous reverse key was correct, but it summed each pair and imposed universal low/moderate/high cutoffs. The rebuild reports 1-5 domain means and explicitly treats bands as descriptions rather than norms.

Source: Rammstedt, B., & John, O. P. (2007), *Measuring personality in one minute or less: A 10-item short version of the Big Five Inventory in English and German*. https://doi.org/10.1016/j.jrp.2006.02.001

## 2. Emotional skills

The existing ten statements do not match a clearly identified, validated ten-item emotional-intelligence instrument. They are retained to preserve the intended reflection, but the feature is renamed **Emotional skills check-in**.

It reports an overall 1-5 mean plus transparent, informal groupings for awareness, self-management and empathy. It no longer presents invented EI cutoffs or a validated "EQ" claim.

If this is intended for research publication, replace it with a licensed/permission-cleared validated instrument and preregister its scoring.

## 3. Subjective Happiness Scale

Responses use 1-7. Item 4 is reverse-scored, then the **mean of all four items** is reported (range 1-7).

The old app reverse-scored the correct item but reported a 4-28 sum with homemade cutoffs.

Source and scoring instructions: Sonja Lyubomirsky, Subjective Happiness Scale. https://sonjalyubomirsky.com/publications/

## 4. Perceived Stress Scale - PSS-4

Responses now use the source scale's 0-4 values. Items 2 and 3 are reverse-scored, then all four items are summed (range 0-16).

The previous arithmetic happened to produce the same 0-16 total after converting from a 1-5 UI. The rebuild makes the mapping explicit and removes diagnostic cutoffs. The scale authors state that the PSS is not diagnostic and has no score cutoffs.

Source and scoring instructions: Carnegie Mellon University Laboratory for the Study of Stress, Immunity, and Disease. https://www.cmu.edu/dietrich/psychology/stress-immunity-disease-lab/scales/html/pssscoring.html

## 5. Motivation snapshot

The prior code called this "SWEIMS 12 items," but the published WEIMS is an 18-item instrument with six three-item subscales. The current 12 statements omit integrated regulation and contain unequal numbers of items across the remaining subscales.

The rebuild keeps the 12 statements as an **adapted SDT reflection set**, not as the validated WEIMS. Each subscale is now an average, so three-item groups no longer win simply because they contain more items. Universal low/moderate/high cutoffs were removed.

Source: Tremblay, M. A., Blanchard, C. M., Taylor, S., Pelletier, L. G., & Villeneuve, M. (2009), *Work Extrinsic and Intrinsic Motivation Scale: Its value for organizational psychology research*. https://doi.org/10.1037/a0015167

The Center for Self-Determination Theory notes that WEIMS is an 18-item copyrighted questionnaire and commercial use requires permission: https://selfdeterminationtheory.org/work-extrinsic-and-intrinsic-motivation-scale/
