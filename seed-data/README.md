# Seed Data

Pre-built note sets for [FN] DULY NOTED (and the related [FN] I KNEW THAT quiz mode). Drop these files into the tool via "Load a note set" to get a ready-to-use set of study notes on each condition.

## Source Attribution

Facts in these note sets are sourced from the **Centre for Addiction and Mental Health (CAMH)** at [camh.ca](https://www.camh.ca) and the **National Institute of Mental Health (NIMH)** at [nimh.nih.gov](https://www.nimh.nih.gov). Most notes draw from both sources. All content is paraphrased, not quoted.

Source URLs for each note are recorded in its `source` field. When a note draws from both CAMH and NIMH, URLs are separated by ` | `.

CAMH is Canada's largest mental health and addiction teaching hospital. NIMH is a U.S. federal research agency. Neither organization has endorsed or reviewed these note sets.

## Included Files

| File | Condition |
|---|---|
| `duly-noted-adhd.json` | Attention-Deficit/Hyperactivity Disorder (ADHD) |
| `duly-noted-anxiety.json` | Anxiety Disorders (GAD, Panic Disorder, Social Anxiety, Specific Phobia) |
| `duly-noted-asd.json` | Autism Spectrum Disorder (ASD) |
| `duly-noted-bipolar.json` | Bipolar Disorder (Mania, Hypomania, Bipolar Depression, Mixed Episodes) |
| `duly-noted-depression.json` | Depression (MDD, PDD, Postpartum, SAD) |
| `duly-noted-ocd.json` | Obsessive-Compulsive Disorder (OCD) |
| `duly-noted-ptsd.json` | Post-Traumatic Stress Disorder (PTSD) |

Each file contains 14 notes covering: overview/definition, key subtypes or symptom clusters, diagnostic criteria, treatments, prevalence statistics, and common misconceptions.

## Note Format

Each file is a JSON array of note objects. Every note object has the following top-level fields:

```json
{
  "id": "seed-adhd-001",
  "mode": "structured",
  "template": "thing",
  "subject": "ADHD",
  "category": "Mental Health",
  "gradeLevel": "Adult",
  "tags": ["overview", "definition"],
  "date": "2026-03-13",
  "source": "https://www.camh.ca/... | https://www.nimh.nih.gov/...",
  "fields": {
    "title": "",
    "body": "",
    "name": "",
    "definition": "",
    "example": "",
    "when": "",
    "where": "",
    "why": "",
    "question": "",
    "answer": "",
    "mainNotes": "",
    "cueColumn": "",
    "summary": ""
  }
}
```

All 13 `fields` keys are always present. Unused fields are empty strings. Which fields are populated depends on the `template`:

- `thing` — name + definition (optional: example). Quiz: "What is [name]?" → definition
- `process` — name + body (optional: example). Quiz: "How does [name] work?" → body
- `qa` — question + answer. Quiz: question → answer
- `quick` — title + body. Quiz: title → body
- `person` — name + body (optional: when, where). Quiz: "What did [name] do?" → body
- `event` — body + when (optional: where, why). Quiz generates two cards: when → body and body → when
- `place` — name + definition (optional: where). Quiz: "What is [name]?" → definition
- `cornell` — mainNotes + cueColumn + summary. Quiz: cueColumn → mainNotes

## How to Add a New Set

1. Create a new file named `duly-noted-[topic].json` in this folder using the same structure shown above.
2. Follow the ID format: `seed-[topic]-001`, `seed-[topic]-002`, etc.
3. Ensure every note has all 13 `fields` keys present (set unused ones to `""`).
4. In the tool, use "Load a note set" to import the file.

## Note

These note sets are study aids only. They are not medical advice and are not a substitute for professional diagnosis or treatment. If you have questions about a mental health condition, consult a qualified healthcare provider.
